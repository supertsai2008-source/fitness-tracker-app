import { FoodItem } from "../types";

// Representative international chains & fast food items (subset)
export const FOODS: FoodItem[] = [
  // McDonald's
  { id: "mc_bigmac", name: "McDonald's Big Mac", nameZh: "麥當勞 大麥克", brand: "McDonald's", calories: 550, protein: 25, carbs: 45, fat: 33, servingSize: "1 burger", servingNameZh: "1 個", isCustom: false, portionHints: ["一個漢堡"], sizeOptions: [ { label: "標準", factor: 1, zh: "標準" } ] },
  { id: "mc_fries_m", name: "McDonald's Fries (Medium)", nameZh: "麥當勞 薯條(中)", brand: "McDonald's", calories: 340, protein: 4, carbs: 44, fat: 16, servingSize: "1 medium", servingNameZh: "中份", isCustom: false, portionHints: ["紙盒一份"], sizeOptions: [ { label: "中", factor: 1, zh: "中" }, { label: "大", factor: 1.3, zh: "大" } ] },
  { id: "mc_mcchicken", name: "McChicken", nameZh: "麥香雞", brand: "McDonald's", calories: 400, protein: 14, carbs: 45, fat: 21, servingSize: "1 burger", servingNameZh: "1 個", isCustom: false },

  // KFC
  { id: "kfc_original", name: "KFC Original Recipe Chicken (2 pieces)", nameZh: "KFC 原味炸雞(2塊)", brand: "KFC", calories: 730, protein: 42, carbs: 26, fat: 49, servingSize: "2 pieces", servingNameZh: "2 塊", isCustom: false, cookingMethod: "deep_fry" },
  { id: "kfc_popcorn_m", name: "KFC Popcorn Chicken (Medium)", nameZh: "KFC 爆米花雞(中)", brand: "KFC", calories: 430, protein: 19, carbs: 28, fat: 27, servingSize: "1 medium", servingNameZh: "中份", isCustom: false, cookingMethod: "deep_fry" },

  // Burger King
  { id: "bk_whopper", name: "Whopper", nameZh: "華堡", brand: "Burger King", calories: 657, protein: 28, carbs: 49, fat: 40, servingSize: "1 burger", servingNameZh: "1 個", isCustom: false, cookingMethod: "grilled" },
  { id: "bk_kingfries_m", name: "King Fries (Medium)", nameZh: "薯條(中)", brand: "Burger King", calories: 385, protein: 5, carbs: 52, fat: 17, servingSize: "1 medium", servingNameZh: "中份", isCustom: false },

  // Subway
  { id: "subway_turkey_6", name: "Subway 6\" Turkey Breast", nameZh: "SUBWAY 6吋 火雞胸", brand: "Subway", calories: 280, protein: 18, carbs: 46, fat: 4, servingSize: "6 inch", servingNameZh: "6 吋", isCustom: false, sizeOptions: [ { label: "6吋", factor: 1, zh: "6吋" }, { label: "12吋", factor: 2, zh: "12吋" } ] },
  { id: "subway_tuna_6", name: "Subway 6\" Tuna", nameZh: "SUBWAY 6吋 鮪魚", brand: "Subway", calories: 480, protein: 20, carbs: 46, fat: 26, servingSize: "6 inch", servingNameZh: "6 吋", isCustom: false },

  // Starbucks
  { id: "sb_grande_latte", name: "Starbucks Latte (Grande)", nameZh: "星巴克 拿鐵(中杯)", brand: "Starbucks", calories: 190, protein: 12, carbs: 18, fat: 7, servingSize: "16 fl oz", servingNameZh: "中杯", isCustom: false, portionHints: ["中杯 16oz"], sizeOptions: [ { label: "中杯", factor: 1, zh: "中杯" }, { label: "大杯", factor: 1.25, zh: "大杯" } ], cookingInstructions: "可選低脂/燕麥奶替代。" },
  { id: "sb_cappuccino", name: "Starbucks Cappuccino (Tall)", nameZh: "星巴克 卡布奇諾(小)", brand: "Starbucks", calories: 80, protein: 5, carbs: 10, fat: 3, servingSize: "12 fl oz", servingNameZh: "小杯", isCustom: false },

  // Pizza Hut
  { id: "ph_pepperoni_m", name: "Pizza Hut Pepperoni (Medium Slice)", nameZh: "必勝客 佩珀羅尼(中片)", brand: "Pizza Hut", calories: 260, protein: 11, carbs: 29, fat: 11, servingSize: "1 slice", servingNameZh: "1 片", isCustom: false, portionHints: ["一片披薩"], sizeOptions: [ { label: "中片", factor: 1, zh: "中片" }, { label: "大片", factor: 1.2, zh: "大片" } ] },
  { id: "ph_margherita_m", name: "Pizza Hut Margherita (Medium Slice)", nameZh: "必勝客 瑪格麗特(中片)", brand: "Pizza Hut", calories: 220, protein: 9, carbs: 27, fat: 8, servingSize: "1 slice", servingNameZh: "1 片", isCustom: false },

  // Domino's
  { id: "dom_pepperoni_m", name: "Domino's Pepperoni (Medium Slice)", nameZh: "達美樂 佩珀羅尼(中片)", brand: "Domino's", calories: 215, protein: 9, carbs: 26, fat: 8, servingSize: "1 slice", servingNameZh: "1 片", isCustom: false },
  { id: "dom_deluxe_m", name: "Domino's Deluxe (Medium Slice)", nameZh: "達美樂 綜合(中片)", brand: "Domino's", calories: 230, protein: 10, carbs: 27, fat: 9, servingSize: "1 slice", servingNameZh: "1 片", isCustom: false },

  // Taco Bell
  { id: "tb_crunchy_taco", name: "Taco Bell Crunchy Taco", nameZh: "脆皮塔可", brand: "Taco Bell", calories: 170, protein: 8, carbs: 13, fat: 9, servingSize: "1 taco", servingNameZh: "1 個", isCustom: false },
  { id: "tb_burrito_beef", name: "Taco Bell Beef Burrito", nameZh: "牛肉捲餅", brand: "Taco Bell", calories: 430, protein: 16, carbs: 63, fat: 14, servingSize: "1 burrito", servingNameZh: "1 份", isCustom: false },

  // Shake Shack
  { id: "ss_shackburger", name: "ShackBurger", nameZh: "招牌牛肉堡", brand: "Shake Shack", calories: 530, protein: 26, carbs: 39, fat: 32, servingSize: "1 burger", servingNameZh: "1 個", isCustom: false },
  { id: "ss_fries", name: "Crinkle-Cut Fries", nameZh: "波浪薯條", brand: "Shake Shack", calories: 470, protein: 6, carbs: 63, fat: 21, servingSize: "1 serving", servingNameZh: "1 份", isCustom: false },

  // Five Guys
  { id: "fg_cheeseburger", name: "Cheeseburger", nameZh: "起司漢堡", brand: "Five Guys", calories: 980, protein: 47, carbs: 40, fat: 55, servingSize: "1 burger", servingNameZh: "1 個", isCustom: false },
  { id: "fg_little_fries", name: "Little Fries", nameZh: "小薯條", brand: "Five Guys", calories: 530, protein: 8, carbs: 72, fat: 23, servingSize: "1 serving", servingNameZh: "小份", isCustom: false },

  // Jollibee
  { id: "jb_chickenjoy_2", name: "Chickenjoy (2pc)", nameZh: "快樂雞(2塊)", brand: "Jollibee", calories: 710, protein: 38, carbs: 35, fat: 44, servingSize: "2 pieces", servingNameZh: "2 塊", isCustom: false, cookingMethod: "deep_fry" },
  { id: "jb_jolly_spaghetti", name: "Jolly Spaghetti", nameZh: "快樂義大利麵", brand: "Jollibee", calories: 560, protein: 20, carbs: 82, fat: 16, servingSize: "1 bowl", servingNameZh: "1 碗", isCustom: false },

  // 7-Eleven Ready to Eat (TW)
  { id: "sev_bento_light", name: "7-Eleven Light Bento", nameZh: "7-11 清爽便當", brand: "7-Eleven", calories: 780, protein: 32, carbs: 98, fat: 24, servingSize: "1 box", servingNameZh: "1 盒", isCustom: false, portionHints: ["便當一盒"] },
  { id: "sev_onigiri_tuna", name: "7-Eleven Tuna Onigiri", nameZh: "7-11 鮪魚飯糰", brand: "7-Eleven", calories: 220, protein: 6, carbs: 42, fat: 3, servingSize: "1 piece", servingNameZh: "1 個", isCustom: false },
];
