declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: any);
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: {
            input: string;
            componentRestrictions?: { country: string };
            types?: string[];
          },
          callback: (
            predictions: Array<{
              place_id: string;
              description: string;
              structured_formatting: {
                main_text: string;
                secondary_text: string;
              };
            }> | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map);
        getDetails(
          request: {
            placeId: string;
            fields: string[];
          },
          callback: (
            place: {
              formatted_address?: string;
              geometry?: {
                location?: {
                  lat(): number;
                  lng(): number;
                };
              };
              name?: string;
              place_id?: string;
            } | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
      }
    }
  }
}

export {};