import frappe

def create_test_products():
    categories = [
        {"category_name": "Cakes", "description": "Gourmet celebration cakes"},
        {"category_name": "Bento Cakes", "description": "Cute mini celebration bento cakes"},
        {"category_name": "Brownies", "description": "Rich fudgy chocolate brownies"},
        {"category_name": "Dessert Tubs", "description": "Layered dessert cake tubs"}
    ]

    for cat in categories:
        if not frappe.db.exists("Product Category", {"category_name": cat["category_name"]}):
            c_doc = frappe.get_doc({
                "doctype": "Product Category",
                "category_name": cat["category_name"],
                "description": cat["description"],
                "is_active": 1
            })
            c_doc.insert(ignore_permissions=True)

    products_data = [
        {
            "product_name": "Classic Belgian Chocolate Truffle Cake",
            "category": "Cakes",
            "product_type": "Cake",
            "starting_price": 650,
            "offer_price": 599,
            "product_weight_label": "500g / 1.1 lbs",
            "default_egg_type": "Eggless",
            "serves": "4-6 Servings",
            "short_description": "Moist chocolate sponge layered with 70% dark Belgian cocoa ganache.",
            "description": "<p>Indulge in our classic Belgian Chocolate Truffle Cake. Made with premium imported dark cocoa, layered with velvety dark ganache, and hand-finished with cocoa nibs.</p>",
            "main_image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
            "thumbnail_image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
            "is_active": 1,
            "is_featured": 1,
            "is_best_seller": 1,
            "gallery": [
                {"image": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800", "caption": "Slice view"},
                {"image": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800", "caption": "Top detail"}
            ],
            "variants": [
                {"variant_type": "Size", "variant_label": "500g (Standard)", "price_adjustment": 0, "is_default": 1, "is_active": 1},
                {"variant_type": "Size", "variant_label": "1kg (Large)", "price_adjustment": 500, "is_default": 0, "is_active": 1}
            ],
            "addons": [
                {"addon_name": "Birthday Candle Set 🕯️", "price": 49, "is_active": 1},
                {"addon_name": "Custom Sparkler Candle ✨", "price": 99, "is_active": 1}
            ]
        },
        {
            "product_name": "Red Velvet Cream Cheese Bento Cake",
            "category": "Bento Cakes",
            "product_type": "Bento Cake",
            "starting_price": 380,
            "offer_price": 349,
            "product_weight_label": "250g Bento",
            "default_egg_type": "Eggless",
            "serves": "1-2 Servings",
            "short_description": "Mini celebration bento cake with rich Philadelphia cream cheese frosting.",
            "description": "<p>A delicate red velvet bento cake packed in an eco-friendly sugarcane box. Perfect for intimate celebrations, birthdays, or sweet surprises!</p>",
            "main_image": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=800",
            "thumbnail_image": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400",
            "is_active": 1,
            "is_best_seller": 1,
            "variants": [
                {"variant_type": "Flavour", "variant_label": "Classic Red Velvet", "price_adjustment": 0, "is_default": 1, "is_active": 1},
                {"variant_type": "Flavour", "variant_label": "Nutella Red Velvet", "price_adjustment": 40, "is_default": 0, "is_active": 1}
            ],
            "addons": [
                {"addon_name": "Mini Birthday Card 💌", "price": 30, "is_active": 1}
            ]
        },
        {
            "product_name": "Fudgy Belgian Dark Chocolate Brownie Box",
            "category": "Brownies",
            "product_type": "Brownie",
            "starting_price": 520,
            "offer_price": 480,
            "product_weight_label": "Box of 6 Pcs",
            "default_egg_type": "Egg",
            "serves": "3-6 Servings",
            "short_description": "Box of 6 signature crinkly-top fudge brownies made with pure French butter.",
            "description": "<p>Dense, fudgy, and melt-in-your-mouth brownies baked daily using 55% cocoa dark chocolate and French cultured butter.</p>",
            "main_image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
            "thumbnail_image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
            "is_active": 1,
            "is_featured": 1,
            "addons": [
                {"addon_name": "Warm Chocolate Drizzle Cup 🍫", "price": 60, "is_active": 1}
            ]
        },
        {
            "product_name": "Lotus Biscoff Crunch Brownie Box",
            "category": "Brownies",
            "product_type": "Brownie",
            "starting_price": 560,
            "offer_price": 0,
            "product_weight_label": "Box of 6 Pcs",
            "default_egg_type": "Eggless",
            "serves": "3-6 Servings",
            "short_description": "Fudge brownies smothered with thick Lotus Biscoff spread & crushed speculoos biscuits.",
            "description": "<p>For Biscoff lovers! Decadent brownies topped with creamy Belgian speculoos spread and crunchy biscuit crumbles.</p>",
            "main_image": "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=800",
            "thumbnail_image": "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400",
            "is_active": 1,
            "is_best_seller": 1
        },
        {
            "product_name": "Fresh Alphonso Mango Cake Tub",
            "category": "Dessert Tubs",
            "product_type": "Dessert Tub",
            "starting_price": 320,
            "offer_price": 290,
            "product_weight_label": "350ml Tub",
            "default_egg_type": "Eggless",
            "serves": "1-2 Servings",
            "short_description": "Layered dessert tub with fresh Alphonso mango pulp, moist sponge & light cream.",
            "description": "<p>Real Ratnagiri Alphonso mango chunks, vanilla bean sponge, and light whipped cream layered in a reusable dessert tub.</p>",
            "main_image": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800",
            "thumbnail_image": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=400",
            "is_active": 1
        },
        {
            "product_name": "Salted Caramel Pecan Cake Tub",
            "category": "Dessert Tubs",
            "product_type": "Dessert Tub",
            "starting_price": 340,
            "offer_price": 0,
            "product_weight_label": "350ml Tub",
            "default_egg_type": "Eggless",
            "serves": "1-2 Servings",
            "short_description": "350ml tub with housemade butterscotch salted caramel and toasted pecans.",
            "description": "<p>Layers of soft butter cake, slow-cooked sea salted caramel sauce, and crunchy toasted pecans.</p>",
            "main_image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800",
            "thumbnail_image": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",
            "is_active": 1
        }
    ]

    for p in products_data:
        existing = frappe.db.get_value("Product", {"product_name": p["product_name"]}, "name")
        if existing:
            doc = frappe.get_doc("Product", existing)
            doc.update(p)
            doc.flags.ignore_permissions = True
            doc.save()
            print(f"Updated product: {p['product_name']}")
        else:
            doc = frappe.get_doc({"doctype": "Product", **p})
            doc.flags.ignore_permissions = True
            doc.insert()
            print(f"Created product: {p['product_name']}")

    frappe.db.commit()
