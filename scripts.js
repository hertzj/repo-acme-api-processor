// section 0 - getting the data with promises
const grabCompanies = () => new Promise((res, rej) => {
    return window.fetch('https://acme-users-api-rev.herokuapp.com/api/companies')
        .then(response => response.json())
        .then(jsonData => res(jsonData))
        .catch(e => rej(e));
});


const grabProducts = () => new Promise((res, rej) => {
    return window.fetch('https://acme-users-api-rev.herokuapp.com/api/products')
        .then(response => response.json())
        .then(jsonData => res(jsonData))
        .catch(e => rej(e))
})

const grabOfferings = () => new Promise((res, rej) => {
    return window.fetch('https://acme-users-api-rev.herokuapp.com/api/offerings')
        .then(response => response.json())
        .then(jsonData => res(jsonData))
        .catch(e => rej(e))
})

// section 1 - helping me understand promises
// grabCompanies().then(result => companies = result)
// grabProducts().then(result => products = result)
// grabOfferings().then(result => offerings = result)



// grabCompanies().then(companies => {
//     const groupedCompaniesByLetter = groupCompaniesByLetter(companies);
//     console.log('grouped companies by letter', groupedCompaniesByLetter)
// })


// section 2 - solution to the hw

Promise.all([grabCompanies(), grabProducts(), grabOfferings()]).then(response => {
    // console.log('response ', response);
    const [companies, products, offerings] = response;

    // returns products within a price range
    const productsInPriceRange = findProdcutsInPriceRange(products, {min: 1, max: 15});
    console.log(productsInPriceRange);

    // returns object where key is first letter of a company name
    // value for each key is those companies
    const groupedCompaniesByLetter = groupCompaniesByLetter(companies);
    console.log(groupedCompaniesByLetter);

    // returns object where key is a state
    // value for each key is the array of those companies in that state
    const groupedCompaniesByState = groupCompaniesByState(companies);
    console.log(groupedCompaniesByState)

    // returns an array of the offerings with each offering having a company and a product
    const processedOfferings = processOfferings({companies, products, offerings});
    console.log(processedOfferings);

    // returns the companies that have n or more offerings
    const threeOrMoreOfferings = companiesByNumberOfOfferings(companies, offerings, 3);
    console.log(threeOrMoreOfferings);

    // returns an array of prodcuts where each product has the average price of it's offerings
    const processedProducts = processProducts({products, offerings});
    console.log(processedProducts)
})




const findProdcutsInPriceRange = (products, range) => {
    const min = range.min;
    const max = range.max

    return products.filter(product => product.suggestedPrice >= min && product.suggestedPrice <= max)
}


const groupCompaniesByLetter = companies => {
    const grouped = {};

    companies.forEach(company => {
        const firstLetter = company.name[0];
        if (firstLetter in grouped) {
            grouped[firstLetter] = grouped[firstLetter].concat([company])
        }
        else {
            grouped[firstLetter] = [company];
        }
    })

    return grouped
}


const groupCompaniesByState = companies => {
    const grouped = {};

    companies.forEach(company => {
        const state = company.state
        if (state in grouped) {
            grouped[state] = grouped[state].concat([company])
        }
        else {
            grouped[state] = [company]
        }
    })

    return grouped
}



const processOfferings = data => {
    const processedOffs = [];
    const offerings = data.offerings;
    const products = data.products;
    const companies = data.companies;


    offerings.forEach(offering => {
        const companyId = offering.companyId;
        const productId = offering.productId;

        const company = companies.filter(comp => comp.id === companyId);
        const product = products.filter(prod => prod.id === productId);


        offering.company = company[0].name; // remove [0].name to just get all the company info
        offering.product = product[0].name //  remove [0].name to just get all the product info

        processedOffs.push(offering);
    })

    return processedOffs;
}


const companiesByNumberOfOfferings = (companies, offerings, n) => {
    const companiesWithNOfferings = [];

    companies.forEach(company => {
        const id = company.id;
        const numOfferings = offerings.filter(offering => offering.companyId === id).length;
        
        if (numOfferings >= n) {
            companiesWithNOfferings.push(company);
        }
    })

    return companiesWithNOfferings
}


const processProducts = data => {
    const processedProds = [];
    const prodcuts = data.products;
    const offerings = data.offerings;

    prodcuts.forEach(product => {
        const id = product.id;

        const prodOfferings = offerings.filter(offering => offering.productId === id);

        const totalPrice = prodOfferings.reduce((total, current) => {
            const price = current.price;
            total += price;
            return total;
        }, 0)
        
        product.averagePrice = totalPrice / prodOfferings.length;
        processedProds.push(product);
    })

    return processedProds;

}

