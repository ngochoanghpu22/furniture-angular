import { Injector } from "@angular/core"
import { AdminService, AdminTypes, PAGED_DATA_ROUTE_API_TOKEN } from "@flex-team/core"
import { DatatableDataProvider } from "../../services"

export const factoryProviders = (type: AdminTypes) => [
    { provide: PAGED_DATA_ROUTE_API_TOKEN, useValue: type, multi: true },
    {
        provide: DatatableDataProvider,
        useFactory: (adminService: AdminService, injector: Injector) => {
            return new DatatableDataProvider(adminService, injector)
        },
        deps: [AdminService, Injector]
    }
]