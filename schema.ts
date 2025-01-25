export const schema = `#graphql 

    type Contacto {
        _id: ID!
        nombre: String!
        telefono: String!
        country: String
        timezones: String
        datetime: String
    }

    type Query {
        getContact(id:ID!): Contacto!
        getContacts: [Contacto!]!
    }

    type Mutation {
        addContact(nombre:String!, telefono:String!): Contacto!
        deleteContact(id:ID!): Boolean!
        updateContact(id:ID!, nombre:String!, telefono:String!): Contacto!
    }
`