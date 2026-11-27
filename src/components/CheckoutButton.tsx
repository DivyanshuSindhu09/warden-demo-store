import { useEffect, useState } from "react";
type CartItem = { sku: string; quantity: number };
export function CheckoutButton({ items }: { items: CartItem[] }) {
  const [stock, setStock] = useState<Record<string, number>>({});
  useEffect(() => {
    let active = true;
    Promise.all(items.map(async ({ sku }) => {
      const response = await fetch(`/api/inventory/${encodeURIComponent(sku)}`);
      if (!response.ok) throw new Error("Inventory lookup failed");
      const { available } = await response.json() as { available: number };
      return [sku, available] as const;
    })).then((entries) => {
      if (active) setStock(Object.fromEntries(entries));
    }).catch(console.error);
    return () => { active = false; };
  }, [items]);
  const canCheckout = items.every((item) => (stock[item.sku] ?? 0) > item.quantity);
  return <button disabled={!canCheckout}>Continue to checkout</button>;
}
