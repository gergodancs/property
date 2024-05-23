import { Request } from 'express';

export type Position = {
    lat: number;
    lng: number;
};

export type Picture = {
    url: string;
    description?: string;
};

export type Property = {
    position: Position;
    district?: number;
    city: string;
    country: string;
    title: string;
    short_description: string;
    description: string;
    price: number;
    email: string;
    pictures?: Picture[];
};
