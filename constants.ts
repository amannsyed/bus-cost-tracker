
import { FareCategory } from './types';

export const INITIAL_FARE_CATEGORIES: FareCategory[] = [
  { id: '1', label: 'Single Fare', price: 2.2 },
  { id: '2', label: 'Double Fare', price: 4.4 },
  { id: '3', label: 'Day Cap', price: 5.0 },
  { id: '4', label: 'Airport Single', price: 5.5 },
  { id: '5', label: 'Airport Return', price: 8.5 },
  { id: '6', label: 'Night Fare', price: 5.0 },
];

export const DEFAULT_WEEKLY_CAP = 24.5;
