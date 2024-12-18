// 城市数据加载器
class CityDataLoader {
    constructor() {
        this.cityData = new Map();
    }

    // 加载CSV数据
    async loadData(csvText) {
        const lines = csvText.trim().split('\n');
        // 跳过标题行
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const cityName = values[0];
            
            const cityData = {
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

    getCityData(cityName) {
        return this.cityData.get(cityName);
    }

    getAvailableCities() {
        return Array.from(this.cityData.keys());
    }
}

// 费用计算器
class CostCalculator {
    constructor(cityDataLoader) {
        this.cityDataLoader = cityDataLoader;
    }

    // 计算月度总支出
    calculateMonthlyCosts(cityData, settings) {
        const housing = this.calculateHousingCost(cityData, settings);
        const dining = this.calculateDiningCost(cityData, settings);
        const transport = this.calculateTransportCost(cityData, settings);
        const education = this.calculateEducationCost(cityData, settings);
        const utilities = this.calculateUtilitiesCost(cityData, settings);

        return {
            住房: Math.round(housing),
            餐饮: Math.round(dining),
            交通: Math.round(transport),
            教育: Math.round(education),
            日常开销: Math.round(utilities),
            总支出: Math.round(housing + dining + transport + education + utilities)
        };
    }

    // 计算月收入情况
    calculateMonthlyIncome(salary, cityData, settings) {
        const monthSalary = salary / 12;
        const insuranceBase = Math.min(
            Math.max(monthSalary, cityData.social_security_base_min),
            cityData.social_security_base_max
        );

        const insurance = {
            养老保险: insuranceBase * 0.08,
            医疗保险: insuranceBase * 0.02,
            失业保险: insuranceBase * 0.005,
            住房公积金: insuranceBase * parseFloat(settings.housingFundRate)
        };

        const monthlyInsurance = Object.values(insurance).reduce((a, b) => a + b, 0);
        const taxable = monthSalary - monthlyInsurance - 5000;
        const tax = this.calculateTax(Math.max(0, taxable));

        return {
            税前工资: Math.round(monthSalary),
            社保公积金: Math.round(monthlyInsurance),
            个税: Math.round(tax),
            税后工资: Math.round(monthSalary - monthlyInsurance - tax)
        };
    }

    // 计算房屋支出
    calculateHousingCost(cityData, settings) {
        if (settings.housingType === 'rental') {
            // 租房逻辑保持不变
            if (settings.location === 'city-center') {
                return settings.roomType === '1b' ? cityData.rent_center_1b : cityData.rent_center_3b;
            } else {
                return settings.roomType === '1b' ? cityData.rent_suburb_1b : cityData.rent_suburb_3b;
            }
        } else {
            // 购房逻辑，考虑公积金优先还贷
            const price = settings.purchaseLocation === 'city-center' ? 
                cityData.house_price_center : cityData.house_price_suburb;
            
            // 计算房贷总额
            const totalPrice = price * settings.houseArea;
            const downPayment = totalPrice * parseFloat(settings.downPaymentRatio);
            const loanAmount = totalPrice - downPayment;

            // 计算每月公积金额度
            const monthSalary = Math.min(
                Math.max(loanAmount / 12, cityData.social_security_base_min),
                cityData.social_security_base_max
            );
            const monthlyProvidentFund = monthSalary * parseFloat(settings.housingFundRate) * 2; // 个人+单位缴存
            
            // 计算公积金可贷额度（假设公积金最高贷款额度为120万）
            const maxProvidentFundLoan = 1200000;
            const providentFundLoanAmount = Math.min(loanAmount, maxProvidentFundLoan);
            const commercialLoanAmount = loanAmount - providentFundLoanAmount;
            
            // 公积金贷款月供（年利率3.1%）
            const providentFundMonthlyPayment = this.calculateMonthlyPayment(
                providentFundLoanAmount, 
                0.031, 
                settings.mortgageYears
            );
            
            // 商业贷款月供（年利率4.41%）
            const commercialMonthlyPayment = this.calculateMonthlyPayment(
                commercialLoanAmount,
                0.0441,
                settings.mortgageYears
            );
            
            // 计算实际月供支出（考虑公积金抵扣）
            const totalMonthlyPayment = providentFundMonthlyPayment + commercialMonthlyPayment;
            return Math.max(0, totalMonthlyPayment - monthlyProvidentFund);
        }
    }

    // 计算房贷月供
    calculateMonthlyPayment(loanAmount, yearRate, years) {
        if (loanAmount <= 0) return 0;
        
        const monthlyRate = yearRate / 12;
        const months = years * 12;
        
        return loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
            (Math.pow(1 + monthlyRate, months) - 1);
    }

    // 计算餐饮支出
    calculateDiningCost(cityData, settings) {
        if (settings.diningStyle === 'home') {
            return cityData.dining_home;
        } else if (settings.diningStyle === 'out') {
            return cityData.dining_out;
        } else if (settings.diningStyle === 'company') {
            return cityData.dining_out*2/7;
        } else {
            const outRatio = parseInt(settings.diningRatio) / 100;
            return cityData.dining_home * (1 - outRatio) + cityData.dining_out * outRatio;
        }
    }

    // 计算交通支出
    calculateTransportCost(cityData, settings) {
        if (settings.transportMode === 'public') {
            return cityData.transport_public;
        } else if (settings.transportMode === 'car') {
            return cityData.transport_car;
        } else {
            return (cityData.transport_public + cityData.transport_car) / 2;
        }
    }

    // 计算教育支出
    calculateEducationCost(cityData, settings) {
        const childrenCount = parseInt(settings.childrenCount);
        if (!childrenCount || childrenCount === 0) return 0;
        
        let totalCost = 0;
        for (let i = 1; i <= childrenCount; i++) {
            const educationLevel = settings[`child${i}Education`];
            if (!educationLevel) continue;

            switch(educationLevel) {
                case '幼儿园':
                    totalCost += cityData.kindergarten;
                    break;
                case '小学':
                    totalCost += cityData.primary;
                    break;
                case '初中':
                    totalCost += cityData.middle;
                    break;
                case '高中':
                    totalCost += cityData.high;
                    break;
                case '国际学校':
                    totalCost += cityData.international;
                    break;
            }
        }
        return totalCost;
    }

    // 计算日常生活支出
    calculateUtilitiesCost(cityData, settings) {
        let entertainmentCost = 0;
        switch(settings.entertainmentLevel) {
            case 'poor': 
                entertainmentCost = 0;
                break;
            case 'low': 
                entertainmentCost = (cityData.fitness + cityData.cinema) * 2;
                break;
            case 'medium':
                entertainmentCost = (cityData.fitness + cityData.cinema) * 4;
                break;
            case 'high':
                entertainmentCost = (cityData.fitness + cityData.cinema) * 8;
                break;
        }
        return cityData.utilities + cityData.mobile_plan + cityData.internet + entertainmentCost;
    }
    // CostCalculator 类继续

    calculateTax(monthlyTaxable) {
        const brackets = [
            { limit: 0, rate: 0.03, deduction: 0 },
            { limit: 3000, rate: 0.1, deduction: 210 },
            { limit: 12000, rate: 0.2, deduction: 1410 },
            { limit: 25000, rate: 0.25, deduction: 2660 },
            { limit: 35000, rate: 0.3, deduction: 4410 },
            { limit: 55000, rate: 0.35, deduction: 7160 },
            { limit: 80000, rate: 0.45, deduction: 15160 }
        ];

        for (let i = brackets.length - 1; i >= 0; i--) {
            if (monthlyTaxable > brackets[i].limit) {
                return monthlyTaxable * brackets[i].rate - brackets[i].deduction;
            }
        }
        return 0;
    }

    // 反推目标城市所需工资
    calculateRequiredSalary(sourceCityName, targetCityName, sourceSalary, settings) {
        const sourceCityData = this.cityDataLoader.getCityData(sourceCityName);
        const targetCityData = this.cityDataLoader.getCityData(targetCityName);
    
        // 1. 计算源城市的每月结余
        const sourceIncome = this.calculateMonthlyIncome(sourceSalary, sourceCityData, settings);
        const sourceCosts = this.calculateMonthlyCosts(sourceCityData, settings);
        const targetSavingsGoal = sourceIncome.税后工资 - sourceCosts.总支出;
    
        // 2. 计算目标城市的总支出
        const targetCosts = this.calculateMonthlyCosts(targetCityData, settings);
        
        // 3. 计算目标城市需要的税后月工资
        const targetAfterTaxMonthly = targetCosts.总支出 + targetSavingsGoal;
        
        // 4. 反推需要的税前年工资
        // 从一个初始工资开始，每次增加或减少1000元进行逼近
        let targetAnnualSalary = sourceSalary; // 从源工资开始尝试
        let lastDiff = Infinity;
        let step = 10000; // 初始步长
        let direction = 0; // 0表示未确定方向，1表示增加，-1表示减少
        
        while (true) {
            const monthlyIncome = this.calculateMonthlyIncome(targetAnnualSalary, targetCityData, settings);
            const diff = monthlyIncome.税后工资 - targetAfterTaxMonthly;
            
            // 如果差异小于100元，认为足够接近了
            if (Math.abs(diff) < 100) {
                break;
            }
            
            // 根据差异调整工资
            if (diff < 0) {
                // 税后工资不够，需要增加税前工资
                targetAnnualSalary += step;
            } else {
                // 税后工资过多，需要减少税前工资
                targetAnnualSalary -= step;
            }
            
            // 如果方向改变了，减小步长
            if ((diff > 0 && lastDiff < 0) || (diff < 0 && lastDiff > 0)) {
                step = Math.max(1000, step / 2);
            }
            
            lastDiff = diff;
        }
        
        return targetAnnualSalary;
    }
}

// UI管理类
class UIManager {
    constructor(cityDataLoader, calculator) {
        this.cityDataLoader = cityDataLoader;
        this.calculator = calculator;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 基础输入变化
        document.getElementById('sourceCity').addEventListener('change', () => this.updateResults());
        document.getElementById('salary').addEventListener('input', () => this.updateResults());
        document.getElementById('housingFundRate').addEventListener('change', () => this.updateResults());

        // 住房选项变化
        document.getElementById('housingType').addEventListener('change', (e) => {
            const isPurchase = e.target.value === 'purchase';
            document.getElementById('rentalOptions').style.display = isPurchase ? 'none' : 'block';
            document.getElementById('purchaseOptions').style.display = isPurchase ? 'block' : 'none';
            this.updateResults();
        });

        // 用餐方式变化
        document.getElementById('diningStyle').addEventListener('change', (e) => {
            document.getElementById('diningRatioContainer').style.display = 
                e.target.value === 'mixed' ? 'block' : 'none';
            this.updateResults();
        });

        // 餐饮比例变化
        document.getElementById('diningRatio').addEventListener('input', (e) => {
            document.getElementById('diningRatioValue').textContent = e.target.value;
            this.updateResults();
        });

        // 子女数量变化
        document.getElementById('childrenCount').addEventListener('change', (e) => {
            this.generateChildEducationOptions(parseInt(e.target.value));
            this.updateResults();
        });

        // 所有其他输入变化
        document.querySelectorAll('select, input').forEach(element => {
            if (!['sourceCity', 'salary', 'housingFundRate', 'housingType', 
                'diningStyle', 'diningRatio', 'childrenCount'].includes(element.id)) {
                element.addEventListener('change', () => this.updateResults());
            }
        });

        // 监听子女教育选项变化
        document.getElementById('childEducation').addEventListener('change', (e) => {
            if (e.target.id.includes('Education')) {
                this.updateResults();
            }
        });
    }

    initializeCitySelector() {
        const cities = this.cityDataLoader.getAvailableCities();
        const selector = document.getElementById('sourceCity');
        selector.innerHTML = cities.map(city => 
            `<option value="${city}">${city}</option>`
        ).join('');
    }

    generateChildEducationOptions(count) {
        const container = document.getElementById('childEducation');
        container.innerHTML = '';
        container.style.display = count > 0 ? 'block' : 'none';
        
        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'input-group';
            div.innerHTML = `
                <label for="child${i}Education">第${i}个子女教育阶段</label>
                <select id="child${i}Education" class="education-select">
                    <option value="幼儿园">幼儿园</option>
                    <option value="小学">小学</option>
                    <option value="初中">初中</option>
                    <option value="高中">高中</option>
                    <option value="国际学校">国际学校</option>
                </select>
            `;
            container.appendChild(div);
        }
    }

    getSettings() {
        const settings = {
            housingType: document.getElementById('housingType').value,
            location: document.getElementById('location').value,
            purchaseLocation: document.getElementById('purchaseLocation')?.value || 'city-center', // 添加购房位置
            roomType: document.getElementById('roomType').value,
            houseArea: parseInt(document.getElementById('houseArea').value || 90),
            downPaymentRatio: document.getElementById('downPaymentRatio').value,
            mortgageYears: parseInt(document.getElementById('mortgageYears').value || 30),
            diningStyle: document.getElementById('diningStyle').value,
            diningRatio: document.getElementById('diningRatio').value,
            transportMode: document.getElementById('transportMode').value,
            childrenCount: document.getElementById('childrenCount').value,
            entertainmentLevel: document.getElementById('entertainmentLevel').value,
            housingFundRate: document.getElementById('housingFundRate').value
        };

        // 添加子女教育设置
        const childrenCount = parseInt(settings.childrenCount);
        for (let i = 1; i <= childrenCount; i++) {
            const educationSelect = document.getElementById(`child${i}Education`);
            if (educationSelect) {
                settings[`child${i}Education`] = educationSelect.value;
            }
        }

        return settings;
    }

    updateResults() {
        const sourceCity = document.getElementById('sourceCity').value;
        const salary = parseFloat(document.getElementById('salary').value);
        if (!salary) return;

        const settings = this.getSettings();
        const comparisonsContainer = document.getElementById('cityComparisons');
        comparisonsContainer.innerHTML = '';

        // 添加源城市卡片
        this.addCityCard(sourceCity, salary, null, settings, true);

        // 添加其他城市卡片
        this.cityDataLoader.getAvailableCities().forEach(city => {
            if (city !== sourceCity) {
                const requiredSalary = this.calculator.calculateRequiredSalary(
                    sourceCity, city, salary, settings
                );
                this.addCityCard(city, requiredSalary, salary, settings, false);
            }
        });
    }

    addCityCard(cityName, salary, sourceSalary, settings, isSource) {
        const cityData = this.cityDataLoader.getCityData(cityName);
        const monthlyIncome = this.calculator.calculateMonthlyIncome(salary, cityData, settings);
        const monthlyCosts = this.calculator.calculateMonthlyCosts(cityData, settings);
        
        const card = document.createElement('div');
        card.className = `city-card ${isSource ? 'source-city' : ''}`;
        
        let salaryComparison = '';
        if (!isSource) {
            const ratio = (salary / sourceSalary * 100).toFixed(1);
            salaryComparison = `<div class="comparison-ratio">
                相当于基准城市工资的 ${ratio}%
            </div>`;
        }

        card.innerHTML = `
            <h4>${cityName}${isSource ? ' (基准城市)' : ''}</h4>
            <div class="income-section">
                <div class="cost-item">
                    <span class="label">税前月收入</span>
                    <span class="value">￥${monthlyIncome.税前工资.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="label">社保公积金</span>
                    <span class="value">￥${monthlyIncome.社保公积金.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="label">个人所得税</span>
                    <span class="value">￥${monthlyIncome.个税.toLocaleString()}</span>
                </div>
                <div class="cost-item highlight">
                    <span class="label">税后月收入</span>
                    <span class="value">￥${monthlyIncome.税后工资.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="costs-section">
                <div class="cost-item">
                    <span class="label">住房支出</span>
                    <span class="value">￥${monthlyCosts.住房.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="label">餐饮支出</span>
                    <span class="value">￥${monthlyCosts.餐饮.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="label">交通支出</span>
                    <span class="value">￥${monthlyCosts.交通.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="label">教育支出</span>
                    <span class="value">￥${monthlyCosts.教育.toLocaleString()}</span>
                </div>
                <div class="cost-item">
                    <span class="label">日常开销</span>
                    <span class="value">￥${monthlyCosts.日常开销.toLocaleString()}</span>
                </div>
            </div>

            <div class="summary-section">
                <div class="cost-item">
                    <span class="label">月度总支出</span>
                    <span class="value">￥${monthlyCosts.总支出.toLocaleString()}</span>
                </div>
                <div class="cost-item highlight">
                    <span class="label">每月结余</span>
                    <span class="value">￥${(monthlyIncome.税后工资 - monthlyCosts.总支出).toLocaleString()}</span>
                </div>
            </div>

            <div class="required-salary">
                所需年薪：￥${Math.round(salary).toLocaleString()}
                ${salaryComparison}
            </div>
        `;

        document.getElementById('cityComparisons').appendChild(card);
    }
}

// 初始化应用
async function initializeApp() {
    try {
        const cityDataLoader = new CityDataLoader();
        
        // 加载CSV数据
        const csvData = `city,social_security_base_min,social_security_base_max,dining_home,dining_out,transport_public,transport_car,rent_center_1b,rent_center_3b,rent_suburb_1b,rent_suburb_3b,house_price_center,house_price_suburb,kindergarten,primary,middle,high,international,meal_cheap,meal_mid,utilities,mobile_plan,internet,fitness,cinema
深圳,2360,31014,1500,2500,200,1500,5388.89,12473.68,2882.35,6607.14,92101.73,48476.44,3900,5000,6000,7000,164615.38,25.0,200.0,487.37,80.14,101.32,315.35,50.0
重庆,3760,19443,1000,1800,240,1200,1828.57,3400.00,1040.00,2100.00,16754.60,9526.36,2300,3000,3500,4000,193333.33,20.0,150.0,310.72,59.67,63.20,147.50,37.5
北京,3200,25000,1300,2200,250,1400,6650.51,15593.75,3558.12,7714.29,105485.52,50268.59,5514,6000,7000,8000,161176.47,30.0,200.0,390.82,67.45,94.03,478.43,60.0
上海,3500,27000,1600,2600,250,1500,7356.25,18979.41,3805.88,9185.19,113981.50,62896.55,8865,7000,8000,9000,219318.18,30.0,250.0,400.52,85.15,120.64,394.01,60.0
成都,2800,19000,1200,1800,200,1200,2272.73,4346.15,1260.00,2258.33,29229.17,15489.35,2729.63,3500,4500,5500,106250.00,20.0,189.5,345.00,93.71,84.94,247.88,40.0
广州,3000,23000,1400,2200,110,1300,3833.33,7961.54,1833.33,4833.33,72107.62,30376.90,3100.00,4000,5000,6000,111833.33,25.0,190.0,474.69,94.50,91.07,206.48,50.0
长沙,2600,18000,1100,1600,100,1200,2300.00,3716.67,1233.33,3433.33,15036.36,39222.22,2225.00,3000,3500,4000,62000.00,20.0,145.0,285.44,49.80,97.50,466.42,40.0
杭州,3100,24000,1300,2000,110,1300,3745.93,8054.81,2038.35,4854.13,60407.46,30427.34,2808.33,4000,5000,6000,235714.29,25.0,180.0,348.07,85.29,114.78,300.11,45.0
南京,3000,21000,1200,2000,200,1300,3037.50,6100.00,2175.00,3800.00,43571.43,25400.00,3749.68,4500,5500,6500,190000.00,20.0,160.0,336.88,87.89,90.00,188.10,45.0
武汉,2800,19000,1100,1800,260,1200,2933.33,5885.71,1716.67,2583.33,27272.73,16000.00,2357.14,3500,4500,5500,63000.00,25.0,150.0,565.00,49.80,99.17,253.22,47.5
西安,3000,19000,950,1600,195,1200,1900.00,3340.00,1380.00,3000.00,18428.57,13714.29,2250.00,3000,4000,5000,129333.33,20.0,130.0,318.27,50.62,85.60,309.62,35.0`;
        
        await cityDataLoader.loadData(csvData);
        
        const calculator = new CostCalculator(cityDataLoader);
        const uiManager = new UIManager(cityDataLoader, calculator);

        uiManager.initializeCitySelector();
        
        const defaultChildrenCount = parseInt(document.getElementById('childrenCount').value || '0');
        uiManager.generateChildEducationOptions(defaultChildrenCount);
        
        uiManager.updateResults();

    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('数据加载失败，请刷新页面重试');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initializeApp);