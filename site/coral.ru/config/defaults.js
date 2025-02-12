export const priceSearchDetail_query_defaults = {
    getHotelDetail: false, // ????
    searchCriterias: {
        reservationType: 2,
        nights: [
            // { value: 7 },
            { value: 14 }
        ],
        roomCriterias: [
            { passengers: [{ passengerType: 0, age: 20 }, { passengerType: 0, age: 20 }] }
        ],
        paging: { pageNumber: 0, pageSize: 255, sortType: 0 },
        imageSizes: [4, 7],
        // should be overridden
        beginDates: [],
        arrivalLocations: []
    }
};

export const packageSearchDetail_query_defaults = {
    getHotelDetail: false, // ????
    searchCriterias: {
        flightType: 2,
        datePickerMode: 0,
        reservationType: 1,
        // beginDates: [
        //     "2025-02-26T00:00:00Z",
        //     "2025-03-28T00:00:00Z"
        // ],
        // arrivalLocations: [...],
        departureLocations: [
            {
                id: "2671-5",
                name: "Москва",
                isCurrent: true,
                type: 5,
                friendlyUrl: "moskva"
            }
        ],
        nights: [{ value: 7 },{ value: 8 },{ value: 9 },{ value: 10 },{ value: 11 },{ value: 12 }],
        roomCriterias: [{ passengers: [{ age: 20, passengerType: 0 }, { age: 20, passengerType: 0 }] }],
        paging: { pageNumber: 1, pageSize: 20, sortType: 0 },
        imageSizes: [4],
    }
}

export const defaultSearchOffersStart = 14;
export const defaultSearchOffersDuration = 30;
