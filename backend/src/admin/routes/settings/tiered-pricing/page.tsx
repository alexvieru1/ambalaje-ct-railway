import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Input, Button, Select } from "@medusajs/ui";
import React, { useState } from "react";

const TieredPricingPage = () => {
  const [productId, setProductId] = useState("");
  const [variants, setVariants] = useState<{ id: string; title: string }[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [price1_9, setPrice1_9] = useState("");
  const [price10_24, setPrice10_24] = useState("");
  const [price25, setPrice25] = useState("");
  const [currencyCode, setCurrencyCode] = useState("ron");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchVariants = async () => {
    try {
      const res = await fetch(`/admin/products/${productId}`);
      if (!res.ok) throw new Error("Invalid Product ID");
      const data = await res.json();
      setVariants(data.product.variants ?? []);
      setMessage("");
    } catch (err: any) {
      setVariants([]);
      setMessage(err.message || "Failed to load variants.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/admin/set-tiered-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: selectedVariant,
          price_1_9: Number(price1_9),
          price_10_24: Number(price10_24),
          price_25: Number(price25),
          currency_code: currencyCode,
        }),
      });
      if (!res.ok) throw new Error("Failed to set prices.");
      setMessage("✅ Prices updated successfully.");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Tiered Pricing Settings</Heading>
      </div>

      <form className="p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Product ID</label>
          <Input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onBlur={fetchVariants}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Variant</label>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a variant
            </option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Price for 1–9
          </label>
          <Input
            type="number"
            value={price1_9}
            onChange={(e) => setPrice1_9(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Price for 10–24
          </label>
          <Input
            type="number"
            value={price10_24}
            onChange={(e) => setPrice10_24(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Price for 25+
          </label>
          <Input
            type="number"
            value={price25}
            onChange={(e) => setPrice25(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Currency Code
          </label>
          <Input
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={loading}>
          Set Tiered Prices
        </Button>

        {message && (
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </form>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Tiered Pricing",
});

export default TieredPricingPage;
