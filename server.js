const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const os = require('os');
const cors = require('cors');
const quotesMockDataJSON = require('./quotes.mock.json');
const PORT = 8080;
var quotesMockData = quotesMockDataJSON.quotes;
// GraphQL schema
const schema = buildSchema(`
    type Query {
        quoteById(id: Int!): Quote
        paginatedQuotes(first: Int, offset: Int, appearsIn: String, author: String, source: String): PaginatedResult
    },
    type PaginatedResult {
        quotes: [Quote]
        total: Int
    },
    type Quote {
        id: Int
        appearsIn: String
        author: String
        content: String!
        image: String
        source: Source!
    },
    enum Source {
        BOOK
        TV
        MOVIE
    }
`);


const getQuote = function(args) { 
    const id = parseInt(args.id, 10);
    return quotesMockData.filter(quote => {
        return quote.id === id;
    })[0];
}
const paginatedQuotes = function( args ) {
    const first = args.first || 0,
        offset = args.offset || 0,
        appearsIn = args.appearsIn,
        author = args.author,
        source = args.source;

    let dataSource = quotesMockData;

    if ( author ) {
        dataSource = dataSource.filter( quote => quote.author === author );
    }
    if ( appearsIn ) {
        dataSource = dataSource.filter( quote => quote.appearsIn === appearsIn );
    }
    if ( source ) {
        dataSource = dataSource.filter( quote => quote.source === source );
    }

    const total = dataSource.length; 
        
    const quotes = dataSource.slice(offset, offset + first);

    return {
        quotes,
        total
    };
}

const root = {
    quoteById: getQuote,
    paginatedQuotes: paginatedQuotes
};
// Create an express server and a GraphQL endpoint
const app = express();
app.use(cors());
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(PORT, () => console.log(`Express GraphQL Server Now Running On ${os.hostname()}:${8080}/graphql`));