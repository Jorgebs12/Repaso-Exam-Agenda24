import { Collection, ObjectId } from "mongodb";
import { AgendaModel, ApiPhone, ApiWorldTime } from "./types.ts";
import { GraphQLError } from "graphql";

type addArgs = {
    nombre: string,
    telefono: string
}

type idArgs = {
    id: string
}

type updateContact = {
    id: string
    nombre: string,
    telefono: string,
}

type Context = {
    AgendaCollection: Collection<AgendaModel>;  
}

export const resolvers = {

    Mutation: {
        addContact: async(_:unknown, args:addArgs, ctx: Context): Promise<AgendaModel> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("No hay API_KEY")
            
                const {nombre, telefono} = args;

                //const existe = await ctx.AgendaCollection.findOne(telefono)
                //if(existe) throw new GraphQLError("El tlf ya existe")

                const url = `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`
                const data = await fetch(url, {headers: { 'X-Api-Key': API_KEY},})

                if (data.status !== 200) throw new GraphQLError("API Ninja Error");

                const response: ApiPhone = await data.json()

                const country = response.country;
                const timezones = response.timezones[0];

                const valido = response.is_valid;
                if(!valido) throw new GraphQLError("El tlf no es valido")

                console.log(country)

                const {insertedId} = await ctx.AgendaCollection.insertOne({
                    nombre,
                    telefono,
                    country,
                    timezones
                })

                return {
                    _id: insertedId,
                    nombre,
                    telefono,
                    country,
                    timezones,
                }
        },

        deleteContact: async (_:unknown, args: idArgs, ctx: Context): Promise<boolean> => {
            const { deletedCount } = await ctx.AgendaCollection.deleteOne({_id: new ObjectId(args.id)})
            return deletedCount === 1;
        },

        updateContact: async (_:unknown, args: updateContact, ctx: Context): Promise<boolean> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("No hay API_KEY")
            
                const {nombre, telefono} = args;

                const url = `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`
                const data = await fetch(url, {headers: { 'X-Api-Key': API_KEY},})

                if (data.status !== 200) throw new GraphQLError("API Ninja Error");

                const response: ApiPhone = await data.json()

                const country = response.country;
                const timezones = response.timezones[0]

                const updateContacto = await ctx.AgendaCollection.findOneAndUpdate({_id: new ObjectId(args.id)},{
                    $set:{
                    nombre,
                    telefono,
                    country,
                    timezones
                    }
                })

                return updateContacto 
        }
    },

    Query: {
        getContact: async(_:unknown, args: idArgs, ctx: Context): Promise<AgendaModel> => {
            return await ctx.AgendaCollection.findOne({_id: new ObjectId(args.id)})
        },

        getContacts: async(_:unknown, __:unknown, ctx: Context): Promise<AgendaModel[]> => {
            return await ctx.AgendaCollection.find().toArray()
        }
    },

    Contacto: {
        _id: (parent: AgendaModel): string => parent._id!.toString(),

        datetime: async (parent:AgendaModel): Promise<ApiWorldTime> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("No hay API_KEY")
            
                const country = parent.timezones;

                const url = `https://api.api-ninjas.com/v1/worldtime?timezone=${country}`

                console.log(url )
                const data = await fetch(url, {headers: { 'X-Api-Key': API_KEY},})

                if (data.status !== 200) throw new GraphQLError("API Ninja Error");

                const response: ApiWorldTime = await data.json()

                const datetime = response.datetime

                return datetime
        }
    }
}