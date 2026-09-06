import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------------------- *
 *  Maps the app's camelCase JS objects to the snake_case columns used in
 *  Supabase/Postgres, and back. Each entity is stored as a real table
 *  (not a single JSON blob), so it's queryable from the Supabase dashboard
 *  or SQL editor too.
 * ---------------------------------------------------------------------- */

const itemToDb = (i) => ({
  id: i.id,
  name: i.name,
  buying_price: i.buyingPrice,
  selling_price: i.sellingPrice,
  stock_qty: i.stockQty,
  reorder_level: i.reorderLevel,
  expiry_date: i.expiryDate || null,
  active: i.active,
});
const itemFromDb = (r) => ({
  id: r.id,
  name: r.name,
  buyingPrice: Number(r.buying_price),
  sellingPrice: Number(r.selling_price),
  stockQty: r.stock_qty,
  reorderLevel: r.reorder_level,
  expiryDate: r.expiry_date || "",
  active: r.active,
});

const saleToDb = (s) => ({
  id: s.id,
  receipt_no: s.receiptNo,
  cashier_id: s.cashierId,
  cashier_name: s.cashierName,
  payment_method: s.paymentMethod,
  total: s.total,
  lines: s.lines,
  created_at: s.createdAt,
});
const saleFromDb = (r) => ({
  id: r.id,
  receiptNo: r.receipt_no,
  cashierId: r.cashier_id,
  cashierName: r.cashier_name,
  paymentMethod: r.payment_method,
  total: Number(r.total),
  lines: r.lines,
  createdAt: r.created_at,
});

const expenseToDb = (e) => ({
  id: e.id,
  description: e.description,
  amount: e.amount,
  date: e.date,
  recorded_by: e.recordedBy,
});
const expenseFromDb = (r) => ({
  id: r.id,
  description: r.description,
  amount: Number(r.amount),
  date: r.date,
  recordedBy: r.recorded_by,
});

const restockToDb = (r) => ({
  id: r.id,
  item_id: r.itemId,
  item_name: r.itemName,
  qty: r.qty,
  cost: r.cost,
  date: r.date,
  note: r.note,
});
const restockFromDb = (r) => ({
  id: r.id,
  itemId: r.item_id,
  itemName: r.item_name,
  qty: r.qty,
  cost: Number(r.cost),
  date: r.date,
  note: r.note || "",
});

const settingsToDb = (s) => ({
  id: 1,
  name: s.name,
  address: s.address,
  phone: s.phone,
  receipt_footer: s.receiptFooter,
  next_receipt_no: s.nextReceiptNo,
});
const settingsFromDb = (r) => ({
  name: r.name,
  address: r.address,
  phone: r.phone,
  receiptFooter: r.receipt_footer,
  nextReceiptNo: r.next_receipt_no,
});

// Replaces the full contents of a table with `rows` (mapped via toDb).
// Mirrors the app's existing "always save the whole array" pattern.
async function replaceAll(table, rows, toDb) {
  const { error: delErr } = await supabase.from(table).delete().not("id", "is", null);
  if (delErr) throw delErr;
  if (rows.length === 0) return;
  const { error: insErr } = await supabase.from(table).insert(rows.map(toDb));
  if (insErr) throw insErr;
}

export const db = {
  async loadAll() {
    const [set, usr, svc, itm, sls, exp, rst] = await Promise.all([
      supabase.from("settings").select("*").eq("id", 1).single(),
      supabase.from("users").select("*"),
      supabase.from("services").select("*"),
      supabase.from("items").select("*"),
      supabase.from("sales").select("*").order("created_at", { ascending: true }),
      supabase.from("expenses").select("*").order("date", { ascending: true }),
      supabase.from("restocks").select("*").order("date", { ascending: true }),
    ]);
    for (const res of [set, usr, svc, itm, sls, exp, rst]) {
      if (res.error) throw res.error;
    }
    return {
      settings: settingsFromDb(set.data),
      users: usr.data.map((r) => ({ id: r.id, name: r.name, pin: r.pin, role: r.role })),
      services: svc.data.map((r) => ({ id: r.id, name: r.name, price: Number(r.price), active: r.active })),
      items: itm.data.map(itemFromDb),
      sales: sls.data.map(saleFromDb),
      expenses: exp.data.map(expenseFromDb),
      restocks: rst.data.map(restockFromDb),
    };
  },

  async saveSettings(next) {
    const { error } = await supabase.from("settings").upsert(settingsToDb(next));
    if (error) throw error;
  },
  async saveUsers(next) {
    await replaceAll("users", next, (u) => ({ id: u.id, name: u.name, pin: u.pin, role: u.role }));
  },
  async saveServices(next) {
    await replaceAll("services", next, (s) => ({ id: s.id, name: s.name, price: s.price, active: s.active }));
  },
  async saveItems(next) {
    await replaceAll("items", next, itemToDb);
  },
  async saveSales(next) {
    await replaceAll("sales", next, saleToDb);
  },
  async saveExpenses(next) {
    await replaceAll("expenses", next, expenseToDb);
  },
  async saveRestocks(next) {
    await replaceAll("restocks", next, restockToDb);
  },
};
