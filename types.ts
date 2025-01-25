import { OptionalId } from "mongodb";

export type AgendaModel = OptionalId<{
    nombre: string,
    telefono: string,
    country: string,
    timezones: string,
}>

export type ApiPhone = {
    is_valid: boolean,
    country: string,
    timezones: string,
}

export type ApiWorldTime = {
    datetime: string
}