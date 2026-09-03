import Razorpay from 'razorpay';
import type { Cart } from '../types.js';

export interface ProviderOrder{providerOrderId:string;amountPaise:number;currency:'INR';}
export interface PaymentProvider{readonly name:'mock'|'razorpay';createOrder(input:{permitId:string;sessionId:string;cart:Cart}):Promise<ProviderOrder>;}

export class MockPaymentProvider implements PaymentProvider{readonly name='mock';async createOrder(input:{permitId:string;cart:Cart}){return {providerOrderId:`order_mock_${input.permitId}`,amountPaise:input.cart.amountPaise,currency:'INR' as const};}}
export class RazorpayPaymentProvider implements PaymentProvider{readonly name='razorpay';private client:Razorpay;constructor(keyId:string,keySecret:string){this.client=new Razorpay({key_id:keyId,key_secret:keySecret});}async createOrder(input:{permitId:string;sessionId:string;cart:Cart}):Promise<ProviderOrder>{const order=await this.client.orders.create({amount:input.cart.amountPaise,currency:'INR',receipt:`cp_${input.permitId}`.slice(0,40),notes:{permitId:input.permitId,sku:input.cart.sku,sessionId:input.sessionId}});return {providerOrderId:order.id,amountPaise:input.cart.amountPaise,currency:'INR'};}}
