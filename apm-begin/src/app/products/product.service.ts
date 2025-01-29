import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product } from './product';
import { catchError, concatMap, map, Observable, of, tap, throwError } from 'rxjs';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private productsUrl = 'api/products';
  
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  //get all products
  getProducts(): Observable<Product[]>{
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log('In http.get pipline')),
      catchError(err => this.handleError(err))
    );
  }

  //get prodcut by Id 
  getProduct(id: number): Observable<Product> {
    const productUrl = this.productsUrl + '/' + id;
    return this.http.get<Product>(productUrl)
    .pipe(
      tap(() => console.log('In http.get by id pipline')),
      concatMap(product => this.getProductWithReviews(product)),
      tap(x => console.log(x)),
      catchError(err=>this.handleError(err))
    );

  }


  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews){
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
      .pipe(
        map(reviews => ({...product, reviews}) as Product )
      )
    }
    else
      return of(product);
  }

  //error handler
  private handleError(err: HttpErrorResponse): Observable<never>{
    const formattedMessage = this.errorService.formatError(err);
    return throwError(()=>formattedMessage);
    // throw formattedMessage;
  }

}
