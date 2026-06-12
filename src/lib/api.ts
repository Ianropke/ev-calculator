export interface PriceData {
  HourUTC: string;
  HourDK: string;
  PriceArea: string;
  SpotPriceDKK: number;
}

// Fallback logic if API fails
export const DEFAULT_SPOT_PRICE = 0.85; // DKK/kWh

export async function fetchCurrentAverageSpotPrice(): Promise<number> {
  try {
    // We fetch DayAheadPrices for DK2 for the current day limit 24 to get the average.
    const res = await fetch('https://api.energidataservice.dk/dataset/DayAheadPrices?limit=24&filter={"PriceArea":["DK2"]}', {
      next: { revalidate: 3600 } // cache for an hour
    });
    
    if (!res.ok) {
      console.warn("Failed to fetch spot prices, using default");
      return DEFAULT_SPOT_PRICE;
    }
    
    const data = await res.json();
    if (data && data.records && data.records.length > 0) {
      const sum = data.records.reduce((acc: number, record: PriceData) => acc + record.SpotPriceDKK, 0);
      // API returns price per MWh in DKK. Convert to DKK/kWh
      const averageMWh = sum / data.records.length;
      return averageMWh / 1000;
    }
    return DEFAULT_SPOT_PRICE;
  } catch (error) {
    console.error("Error fetching spot price:", error);
    return DEFAULT_SPOT_PRICE;
  }
}
