const initialState = {
    list: [],
    activeId: null,
};

const hobbyReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_HOBBY': {
            const newList = state.list;
            return {
                ...state,
                list: [...newList, action.payload],
            };
        }
        case 'SET_ACTIVE_HOBBY': {
            const newActiveId = action.payload.id;

            return {
                ...state,
                activeId: newActiveId,
            };
        }
        default:
            return state;
    }
};

export default hobbyReducer;
