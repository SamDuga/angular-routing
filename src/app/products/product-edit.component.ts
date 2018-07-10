import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Data } from '@angular/router';

import { MessageService } from '../messages/message.service';

import { IProduct } from './product';
import { ProductService } from './product.service';

@Component({
    templateUrl: './app/products/product-edit.component.html',
    styleUrls: ['./app/products/product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

    pageTitle: string = 'Product Edit';
    errorMessage: string;

    private dataValid: { [key: string]: boolean } = {};

    private currentProduct: IProduct;
    private originalProduct: IProduct;

    get product(): IProduct {
        return this.currentProduct;
    }

    set product(value: IProduct) {
        this.currentProduct = value;
        this.originalProduct = Object.assign({}, value);
    }

    get isDirty(): boolean {
        return JSON.stringify(this.originalProduct) !== JSON.stringify(this.currentProduct);
    }

    constructor(private productService: ProductService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        this.route.data.subscribe( (data: Data) => {
            this.onProductRetrieved(data['product']);
        });
    }

    onProductRetrieved(product: IProduct): void {
        this.product = product;

        if (this.product.id === 0) this.pageTitle = 'Add Product';
        else this.pageTitle = `Edit Product: ${this.product.productName}`;
    }

    deleteProduct(): void {
        if (this.product.id === 0)
            // Don't delete, it was never saved.
            this.onSaveComplete();
        else
            if (confirm(`Really delete the product: ${this.product.productName}?`))
                this.productService.deleteProduct(this.product.id)
                    .subscribe(
                        () => this.onSaveComplete(`${this.product.productName} was deleted`),
                        (error: any) => this.errorMessage = <any>error
                    );

    }

    saveProduct(): void {
        if (true === true)
            this.productService.saveProduct(this.product)
                .subscribe(
                    () => this.onSaveComplete(`${this.product.productName} was saved`),
                    (error: any) => this.errorMessage = <any>error
                );
         else this.errorMessage = 'Please correct the validation errors.';
    }

    onSaveComplete(message?: string): void {
        if (message) this.messageService.addMessage(message);

        this.reset();
        // Navigate back to the product list
        this.router.navigate(['/products']);
    }

    validate(): void {
        this.dataValid = {};

        // info tab
        if (this.product.productName  &&
            this.product.productName.length >= 3 &&
            this.product.productCode) this.dataValid['info'] = true;
        else this.dataValid['info'] = false;

        // tags tab

        if (this.product.category &&
            this.product.category.length >= 3) this.dataValid['tags'] = true;
        else this.dataValid['tags'] = false;
    }

    isValid(path: string): boolean {
        this.validate();

        if (path) return this.dataValid[path];

        return (this.dataValid &&
                Object.keys(this.dataValid).every( d => this.dataValid[d] === true));
    }

    reset(): void {
        this.dataValid = null;
        this.currentProduct = null;
        this.originalProduct = null;
    }
}
