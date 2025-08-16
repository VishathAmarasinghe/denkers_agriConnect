import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import SelectorReducer from "./selectorSlice/selector";
import CommonReducer from "./commonSlice/common";
import authReducer from "./authSlice/auth";
import ResourceReducer from "./resourceSlice/resource";
import soilCollectionReducer from './soilCollectionSlice/soilCollection';
import soilTestingReducer from './soilTestingSlice/soilTesting';
import machineRentalReducer from './machineRentalSlice/machineRental';
import warehouseReducer from './warehouseSlice/warehouse';
import farmerWarehouseReducer from './farmerWarehouseSlice/farmerWarehouse';
import marketItemsReducer from './marketItemsSlice/marketItems';

export const store = configureStore({
  reducer: {
    selector: SelectorReducer,
    common: CommonReducer,
    auth: authReducer,
    resource: ResourceReducer,
    soilCollectionReducer,
    soilTestingReducer,
    machineRentalReducer,
    warehouseReducer,
    farmerWarehouseReducer,
    marketItemsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
