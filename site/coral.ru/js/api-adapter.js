function endpointUrl(endpoint) {
    // const host = location.hostname === 'localhost' ? 'http://localhost:8010/proxy' : '//' + location.hostname.replace(/www|new/, 'b2capi');
    const host = location.hostname === 'localhost' ? 'http://localhost:8010/proxy' : '//'
        + location.hostname.replace(/^[^.]+/, 'b2capi');
    return host + endpoint;
}

export async function listHotelInfo(hotelIds, imageSizes = [4, 7]) {
    let { result: infos } = await fetch(endpointUrl('/HotelContent/ListHotelsInfo'), {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelIds, imageSizes })
    }).then(response => response.json());
    return infos;
}

export async function priceSearchDetail(query) {
    let { result: details } = await fetch(endpointUrl('/OnlyHotelProduct/PriceSearchDetail'), {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    }).then(response => response.json());
    return details;
}

export async function priceSearchEncrypt(query) {
    let { result: details } = await fetch(endpointUrl('/OnlyHotelProduct/PriceSearchEncrypt'), {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    }).then(response => response.json());
    return details;
}

export async function fetchArrivalLocation(keyword, type) {
    const query = { text: keyword };
    if (type !== undefined) {
        query.locationTypes = [Number(type)];
    }
    let { result: { locations } } = await fetch(endpointUrl('/OnlyHotelProduct/ListArrivalLocations'), {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    }).then(response => response.json());

    if (locations?.length) {
        // if (type !== undefined) {
        //     locations = locations.filter(loc => loc.type === Number(type));
        // }
        return locations.find(loc => keyword.toUpperCase() === loc.name.toUpperCase()) || locations.at(0);
    } else {
        return null;
    }

}
