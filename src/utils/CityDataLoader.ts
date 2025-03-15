// 城市数据加载器
export interface CityData {
  social_security_base_min: number;
  social_security_base_max: number;
  dining_home: number;
  dining_out: number;
  transport_public: number;
  transport_car: number;
  rent_center_1b: number;
  rent_center_3b: number;
  rent_suburb_1b: number;
  rent_suburb_3b: number;
  house_price_center: number;
  house_price_suburb: number;
  kindergarten: number;
  primary: number;
  middle: number;
  high: number;
  international: number;
  meal_cheap: number;
  meal_mid: number;
  utilities: number;
  mobile_plan: number;
  internet: number;
  fitness: number;
  cinema: number;
}

class CityDataLoader {
  private cityData: Map<string, CityData>;

  constructor() {
    this.cityData = new Map<string, CityData>();
  }

  // 加载CSV数据
  async loadData(csvText: string): Promise<boolean> {
    const lines = csvText.trim().split('\n');
    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const cityName = values[0];
      
      const cityData: CityData = {
        social_security_base_min: parseFloat(values[1]),
        social_security_base_max: parseFloat(values[2]),
        dining_home: parseFloat(values[3]),
        dining_out: parseFloat(values[4]),
        transport_public: parseFloat(values[5]),
        transport_car: parseFloat(values[6]),
        rent_center_1b: parseFloat(values[7]),
        rent_center_3b: parseFloat(values[8]),
        rent_suburb_1b: parseFloat(values[9]),
        rent_suburb_3b: parseFloat(values[10]),
        house_price_center: parseFloat(values[11]),
        house_price_suburb: parseFloat(values[12]),
        kindergarten: parseFloat(values[13]),
        primary: parseFloat(values[14]),
        middle: parseFloat(values[15]),
        high: parseFloat(values[16]),
        international: parseFloat(values[17]),
        meal_cheap: parseFloat(values[18]),
        meal_mid: parseFloat(values[19]),
        utilities: parseFloat(values[20]),
        mobile_plan: parseFloat(values[21]),
        internet: parseFloat(values[22]),
        fitness: parseFloat(values[23]),
        cinema: parseFloat(values[24])
      };
      
      this.cityData.set(cityName, cityData);
    }
    return true;
  }

  getCityData(cityName: string): CityData | undefined {
    return this.cityData.get(cityName);
  }

  getAvailableCities(): string[] {
    return Array.from(this.cityData.keys());
  }
}

export default CityDataLoader; 