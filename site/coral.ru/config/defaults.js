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

export const defaultSearchOffersStart = 14;
export const defaultSearchOffersDuration = 60;
