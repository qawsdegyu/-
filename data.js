/* ======================================================================
   DATA.JS — بيانات المنيو (أصناف + أطباق + أسعار)
   ======================================================================
   يمكنك تعديل هذا الملف لإضافة أصناف وأطباق جديدة بدون تعديل الكود
   ====================================================================== */

const MENU_DATA = {
  restaurant: {
    name: "المطعم",
    slogan: "نكهات لا تُنسى",
    logo: "🔥"
  },

  categories: [
    {
      id: "shawarma",
      name: "شاورما",
      image: "https://picsum.photos/seed/cat-shawarma/400/400",
      color: "#D4A843",
      items: [
        {
          id: "shawarma-chicken",
          name: "شاورما دجاج",
          image: "https://picsum.photos/seed/shawarma-chicken/400/400",
          description: "شاورما دجاج طازجة مع صوص الثوم المميز وخضار مشكلة، ملفوفة بخبز صاج طري",
          price: 15,
          calories: 450,
          color: "#F4A460"
        },
        {
          id: "shawarma-meat",
          name: "شاورما لحمة",
          image: "https://picsum.photos/seed/shawarma-meat/400/400",
          description: "شاورما لحم بقري مشوية على الفحم مع طحينة وبقدونس وبصل مقطع ناعم",
          price: 20,
          calories: 520,
          color: "#CD853F"
        },
        {
          id: "shawarma-mix",
          name: "شاورما مشكل",
          image: "https://picsum.photos/seed/shawarma-mix/400/400",
          description: "مزيج مثالي من شاورما الدجاج واللحمة مع صوصات خاصة وخضار مشكلة",
          price: 25,
          calories: 580,
          color: "#DEB887"
        },
        {
          id: "shawarma-plate",
          name: "صحن شاورما",
          image: "https://picsum.photos/seed/shawarma-plate/400/400",
          description: "صحن شاورما كبير مع أرز بسمتي وسلطة وحمص وخبز محمص",
          price: 35,
          calories: 750,
          color: "#D2B48C"
        }
      ]
    },
    {
      id: "zinger",
      name: "زنجر",
      image: "https://picsum.photos/seed/cat-zinger/400/400",
      color: "#E85D3A",
      items: [
        {
          id: "zinger-classic",
          name: "زنجر كلاسيك",
          image: "https://picsum.photos/seed/zinger-classic/400/400",
          description: "ساندويش زنجر كلاسيكي بقطعة دجاج مقرمشة مع مايونيز وخس",
          price: 18,
          calories: 490,
          color: "#FF6347"
        },
        {
          id: "zinger-spicy",
          name: "زنجر حار",
          image: "https://picsum.photos/seed/zinger-spicy/400/400",
          description: "زنجر بتتبيلة حارة مميزة مع صوص الهالابينو وجبن ذائب",
          price: 22,
          calories: 530,
          color: "#FF4500"
        },
        {
          id: "zinger-supreme",
          name: "زنجر سوبريم",
          image: "https://picsum.photos/seed/zinger-supreme/400/400",
          description: "زنجر مزدوج بقطعتين دجاج مع جبن شيدر وصوص خاص وبصل مقرمش",
          price: 30,
          calories: 720,
          color: "#E8703A"
        },
        {
          id: "zinger-wrap",
          name: "زنجر راب",
          image: "https://picsum.photos/seed/zinger-wrap/400/400",
          description: "قطعة زنجر مقرمشة ملفوفة بخبز التورتيلا مع خضار وصوص رانش",
          price: 20,
          calories: 460,
          color: "#FF7F50"
        }
      ]
    },
    {
      id: "burger",
      name: "برجر",
      image: "https://picsum.photos/seed/cat-burger/400/400",
      color: "#C4A35A",
      items: [
        {
          id: "burger-classic",
          name: "برجر كلاسيك",
          image: "https://picsum.photos/seed/burger-classic/400/400",
          description: "برجر لحم أنغوس ١٥٠ غرام مع جبن شيدر وخس وطماطم وصوص خاص",
          price: 25,
          calories: 650,
          color: "#C4A35A"
        },
        {
          id: "burger-mushroom",
          name: "برجر مشروم",
          image: "https://picsum.photos/seed/burger-mushroom/400/400",
          description: "برجر لحم مع فطر سوتيه وجبن سويسري ذائب وصوص كريمي",
          price: 30,
          calories: 700,
          color: "#B8956A"
        },
        {
          id: "burger-double",
          name: "دبل برجر",
          image: "https://picsum.photos/seed/burger-double/400/400",
          description: "طبقتين من لحم الأنغوس مع جبن مزدوج وبيكون مدخن وصوص باربيكيو",
          price: 38,
          calories: 950,
          color: "#D4A843"
        },
        {
          id: "burger-chicken",
          name: "تشيكن برجر",
          image: "https://picsum.photos/seed/burger-chicken/400/400",
          description: "برجر صدر دجاج مشوي مع أفوكادو وجبن كريمي وخضار طازجة",
          price: 22,
          calories: 480,
          color: "#DAB86A"
        }
      ]
    },
    {
      id: "grills",
      name: "مشاوي",
      image: "https://picsum.photos/seed/cat-grills/400/400",
      color: "#A0522D",
      items: [
        {
          id: "grills-kebab",
          name: "كباب مشوي",
          image: "https://picsum.photos/seed/grills-kebab/400/400",
          description: "أسياخ كباب لحم غنم مشوية على الفحم مع بهارات شرقية مميزة",
          price: 40,
          calories: 380,
          color: "#CD3700"
        },
        {
          id: "grills-tikka",
          name: "تكا دجاج",
          image: "https://picsum.photos/seed/grills-tikka/400/400",
          description: "قطع صدر دجاج متبلة بالزبادي والبهارات، مشوية على الفحم حتى الاحمرار",
          price: 35,
          calories: 320,
          color: "#E8703A"
        },
        {
          id: "grills-mixed",
          name: "مشاوي مشكلة",
          image: "https://picsum.photos/seed/grills-mixed/400/400",
          description: "تشكيلة فاخرة من الكباب والتكا والريش مع أرز بسمتي وسلطات",
          price: 65,
          calories: 850,
          color: "#B5651D"
        },
        {
          id: "grills-ribs",
          name: "ريش غنم",
          image: "https://picsum.photos/seed/grills-ribs/400/400",
          description: "ريش غنم مشوية مع أعشاب وتوابل خاصة، تقدم مع صوص النعناع",
          price: 55,
          calories: 620,
          color: "#A0522D"
        }
      ]
    },
    {
      id: "pizza",
      name: "بيتزا",
      image: "https://picsum.photos/seed/cat-pizza/400/400",
      color: "#E8A832",
      items: [
        {
          id: "pizza-margherita",
          name: "بيتزا مارغريتا",
          image: "https://picsum.photos/seed/pizza-margherita/400/400",
          description: "عجينة رقيقة مع صلصة طماطم طازجة وجبن موزاريلا وريحان",
          price: 28,
          calories: 550,
          color: "#E8A832"
        },
        {
          id: "pizza-pepperoni",
          name: "بيتزا بيبروني",
          image: "https://picsum.photos/seed/pizza-pepperoni/400/400",
          description: "بيتزا كلاسيكية بشرائح بيبروني وجبن موزاريلا غزير وصلصة إيطالية",
          price: 35,
          calories: 680,
          color: "#CC7722"
        },
        {
          id: "pizza-bbq",
          name: "بيتزا باربيكيو",
          image: "https://picsum.photos/seed/pizza-bbq/400/400",
          description: "دجاج مشوي مع صلصة باربيكيو وبصل أحمر وفلفل ملون وجبن مزدوج",
          price: 38,
          calories: 720,
          color: "#D4911A"
        }
      ]
    },
    {
      id: "drinks",
      name: "مشروبات",
      image: "https://picsum.photos/seed/cat-drinks/400/400",
      color: "#4ECDC4",
      items: [
        {
          id: "drinks-mojito",
          name: "موهيتو",
          image: "https://picsum.photos/seed/drinks-mojito/400/400",
          description: "موهيتو منعش بالنعناع الطازج والليمون والصودا المثلجة",
          price: 12,
          calories: 150,
          color: "#4ECDC4"
        },
        {
          id: "drinks-mango",
          name: "عصير مانجو",
          image: "https://picsum.photos/seed/drinks-mango/400/400",
          description: "عصير مانجو طبيعي طازج مع لمسة من الحليب البارد",
          price: 14,
          calories: 200,
          color: "#FFB347"
        },
        {
          id: "drinks-lemon-mint",
          name: "ليمون بالنعناع",
          image: "https://picsum.photos/seed/drinks-lemon-mint/400/400",
          description: "عصير ليمون طازج مع أوراق النعناع والعسل الطبيعي والثلج المجروش",
          price: 10,
          calories: 120,
          color: "#98FB98"
        },
        {
          id: "drinks-strawberry",
          name: "سموذي فراولة",
          image: "https://picsum.photos/seed/drinks-strawberry/400/400",
          description: "سموذي فراولة كريمي مع زبادي يوناني وعسل طبيعي",
          price: 16,
          calories: 180,
          color: "#FF6B8A"
        }
      ]
    }
  ]
};
