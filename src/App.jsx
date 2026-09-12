import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, ShoppingCart, Wrench,
  BarChart3, Users, Settings as SettingsIcon, LogOut, Plus, Minus, X,
  Trash2, Pencil, Search, AlertTriangle, Printer, ArrowLeft, Check,
  Wallet, Lock, Boxes, ClipboardList, Camera, Truck, MessageCircle,
  ImagePlus, Building2, FileText
} from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { db } from "./db";

/* ---------------------------------------------------------------------- *
 *  THEME — a working shop counter, not a showcase. Ink-blue chrome, warm
 *  paper background, a marigold accent for the actions that move money
 *  (complete sale, totals). Amounts render in a mono face throughout, the
 *  way they would on a receipt or ledger.
 * ---------------------------------------------------------------------- */
const INK = "#152233";
const INK_SOFT = "#22344A";
const PAPER = "#FAF8F3";
const PANEL = "#FFFFFF";
const LINE = "#E7E1D3";
const MARIGOLD = "#E29A2E";
const GREEN = "#2F9E58";
const RED = "#C1442E";
const SLATE = "#5B6472";
const BODY_FONT = "'Inter', system-ui, sans-serif";
const MONO_FONT = "'IBM Plex Mono', 'Courier New', monospace";
const DISPLAY_FONT = "'Inter', system-ui, sans-serif";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: #DCD5C2; border-radius: 8px; }
button { font-family: inherit; }
.focus-ring:focus-visible { outline: 2px solid ${MARIGOLD}; outline-offset: 2px; }
@media print {
  body * { visibility: hidden; }
  #receipt-print, #receipt-print * { visibility: visible; }
  #receipt-print { position: absolute; top: 0; left: 0; width: 100%; }
}
`;

const LOGO_DATA_URI = "data:image/jpeg;base64,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";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtKES = (n) => `KSh ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => {
  if (!d) return "";
  const dt = typeof d === "string" && d.length === 10 ? new Date(d + "T00:00:00") : new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateTime = (iso) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const inRange = (iso, from, to) => {
  const d = iso.slice(0, 10);
  return d >= from && d <= to;
};
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const ms = new Date(dateStr + "T00:00:00") - new Date(todayISO() + "T00:00:00");
  return Math.round(ms / 86400000);
};

const PAYMENT_METHODS = ["Cash", "M-Pesa", "Card", "Other"];
const DEFAULT_SERVICES = [
  { id: uid(), name: "Consultation", price: 100, active: true },
  { id: uid(), name: "Blood Pressure Check", price: 50, active: true },
  { id: uid(), name: "Blood Sugar Test", price: 100, active: true },
  { id: uid(), name: "Malaria Test", price: 100, active: true },
  { id: uid(), name: "Injection Administration", price: 100, active: true },
  { id: uid(), name: "Wound Dressing", price: 150, active: true },
  { id: uid(), name: "Nebulization", price: 200, active: true },
  { id: uid(), name: "Weight Check", price: 20, active: true },
  { id: uid(), name: "Home Delivery", price: 200, active: true },
];
const DEFAULT_ITEMS = [
  { id: uid(), name: "Paracetamol 500mg (10 tabs)", buyingPrice: 15, sellingPrice: 30, stockQty: 100, reorderLevel: 20, expiryDate: "2027-06-30", active: true },
  { id: uid(), name: "Amoxicillin 500mg (10 caps)", buyingPrice: 60, sellingPrice: 120, stockQty: 40, reorderLevel: 10, expiryDate: "2027-03-31", active: true },
  { id: uid(), name: "Coartem (Artemether/Lumefantrine)", buyingPrice: 150, sellingPrice: 280, stockQty: 30, reorderLevel: 8, expiryDate: "2027-01-31", active: true },
  { id: uid(), name: "ORS Sachet", buyingPrice: 15, sellingPrice: 30, stockQty: 60, reorderLevel: 15, expiryDate: "2027-08-31", active: true },
  { id: uid(), name: "Cough Syrup 100ml", buyingPrice: 80, sellingPrice: 150, stockQty: 25, reorderLevel: 8, expiryDate: "2026-12-31", active: true },
  { id: uid(), name: "Antacid Suspension 200ml", buyingPrice: 100, sellingPrice: 180, stockQty: 20, reorderLevel: 6, expiryDate: "2027-05-31", active: true },
  { id: uid(), name: "Vitamin C Tablets", buyingPrice: 50, sellingPrice: 100, stockQty: 35, reorderLevel: 10, expiryDate: "2028-01-31", active: true },
  { id: uid(), name: "Multivitamins", buyingPrice: 120, sellingPrice: 220, stockQty: 20, reorderLevel: 6, expiryDate: "2027-11-30", active: true },
  { id: uid(), name: "Diclofenac Gel", buyingPrice: 90, sellingPrice: 160, stockQty: 15, reorderLevel: 5, expiryDate: "2027-04-30", active: true },
  { id: uid(), name: "Antiseptic (Dettol) 100ml", buyingPrice: 60, sellingPrice: 110, stockQty: 25, reorderLevel: 8, expiryDate: "2028-06-30", active: true },
  { id: uid(), name: "Cotton Wool", buyingPrice: 40, sellingPrice: 80, stockQty: 20, reorderLevel: 5, expiryDate: "", active: true },
  { id: uid(), name: "Bandage Roll", buyingPrice: 30, sellingPrice: 60, stockQty: 30, reorderLevel: 8, expiryDate: "", active: true },
  { id: uid(), name: "Surgical Gloves (pair)", buyingPrice: 10, sellingPrice: 20, stockQty: 100, reorderLevel: 20, expiryDate: "2028-02-28", active: true },
  { id: uid(), name: "Face Mask", buyingPrice: 5, sellingPrice: 15, stockQty: 150, reorderLevel: 30, expiryDate: "", active: true },
  { id: uid(), name: "Hand Sanitizer 100ml", buyingPrice: 50, sellingPrice: 100, stockQty: 30, reorderLevel: 8, expiryDate: "2027-09-30", active: true },
];
const DEFAULT_USERS = [
  { id: uid(), name: "Admin", pin: "1234", role: "Administrator" },
  { id: uid(), name: "Cashier", pin: "0000", role: "Cashier" },
];
const DEFAULT_SETTINGS = {
  name: "Marrions Pharmacy", address: "P.O. Box 15 Kamakuywa", phone: "", receiptFooter: "Thank you for your business! Get well soon.", nextReceiptNo: 100, nextPoNo: 1,
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [users, setUsersState] = useState([]);
  const [services, setServicesState] = useState([]);
  const [items, setItemsState] = useState([]);
  const [sales, setSalesState] = useState([]);
  const [expenses, setExpensesState] = useState([]);
  const [restocks, setRestocksState] = useState([]);
  const [vendors, setVendorsState] = useState([]);
  const [purchaseOrders, setPurchaseOrdersState] = useState([]);
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("sale");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await db.loadAll();
        setSettingsState(all.settings);
        setUsersState(all.users);
        setServicesState(all.services);
        setItemsState(all.items);
        setSalesState(all.sales);
        setExpensesState(all.expenses);
        setRestocksState(all.restocks);
        setVendorsState(all.vendors);
        setPurchaseOrdersState(all.purchaseOrders);
      } catch (e) {
        console.error("Failed to load from Supabase", e);
        setLoadError(e.message || "Could not connect to the database.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Every update still replaces the whole in-memory array (as before) and
  // then syncs that same array to Supabase, so the rest of the app's logic
  // is unchanged — only where the data lives is different.
  const update = {
    settings: async (next) => { setSettingsState(next); await db.saveSettings(next); },
    users: async (next) => { setUsersState(next); await db.saveUsers(next); },
    services: async (next) => { setServicesState(next); await db.saveServices(next); },
    items: async (next) => { setItemsState(next); await db.saveItems(next); },
    sales: async (next) => { setSalesState(next); await db.saveSales(next); },
    expenses: async (next) => { setExpensesState(next); await db.saveExpenses(next); },
    restocks: async (next) => { setRestocksState(next); await db.saveRestocks(next); },
    vendors: async (next) => { setVendorsState(next); await db.saveVendors(next); },
    purchaseOrders: async (next) => { setPurchaseOrdersState(next); await db.savePurchaseOrders(next); },
  };

  const isAdmin = session?.role === "Administrator";

  const completeSale = async (cartLines, paymentMethod) => {
    // Re-check stock against the freshest numbers right before committing.
    for (const line of cartLines) {
      if (line.kind === "item") {
        const current = items.find((i) => i.id === line.refId);
        if (!current || current.stockQty < line.qty) {
          throw new Error(`Not enough stock for ${line.name} (only ${current ? current.stockQty : 0} left).`);
        }
      }
    }
    const total = cartLines.reduce((s, l) => s + l.subtotal, 0);
    const receiptNo = settings.nextReceiptNo;
    const sale = {
      id: uid(), receiptNo, cashierId: session.id, cashierName: session.name,
      paymentMethod, total, lines: cartLines, createdAt: new Date().toISOString(),
    };
    const nextItems = items.map((i) => {
      const line = cartLines.find((l) => l.kind === "item" && l.refId === i.id);
      return line ? { ...i, stockQty: i.stockQty - line.qty } : i;
    });
    await update.items(nextItems);
    await update.sales([...sales, sale]);
    await update.settings({ ...settings, nextReceiptNo: receiptNo + 1 });
    setReceipt(sale);
    return sale;
  };

  // Deleting a sale restores any stock it took out, then removes the record.
  const deleteSale = async (saleId) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const nextItems = items.map((i) => {
      const line = sale.lines.find((l) => l.kind === "item" && l.refId === i.id);
      return line ? { ...i, stockQty: i.stockQty + line.qty } : i;
    });
    await update.items(nextItems);
    await update.sales(sales.filter((s) => s.id !== saleId));
  };

  if (loading) {
    return (
      <div style={{ background: PAPER, minHeight: "100vh" }} className="flex items-center justify-center">
        <style>{GLOBAL_CSS}</style>
        <p style={{ color: SLATE, fontSize: 13.5 }}>Loading Marrions Pharmacy…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ background: PAPER, minHeight: "100vh" }} className="flex items-center justify-center px-6">
        <style>{GLOBAL_CSS}</style>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <AlertTriangle size={28} color={RED} style={{ marginBottom: 10 }} />
          <p style={{ fontWeight: 700, marginBottom: 6 }}>Couldn't connect to the database</p>
          <p style={{ color: SLATE, fontSize: 13 }}>{loadError}</p>
          <p style={{ color: SLATE, fontSize: 12, marginTop: 10 }}>
            Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ background: PAPER, minHeight: "100vh" }}>
        <style>{GLOBAL_CSS}</style>
        <LoginScreen users={users} settings={settings} onLogin={(u) => { setSession(u); setTab(u.role === "Administrator" ? "dashboard" : "sale"); }} />
      </div>
    );
  }

  const ctx = {
    session, isAdmin, settings, users, services, items, sales, expenses, restocks, vendors, purchaseOrders,
    update, completeSale, deleteSale, showReceipt: setReceipt,
  };

  return (
    <div style={{ background: PAPER, minHeight: "100vh", color: INK, fontFamily: BODY_FONT }}>
      <style>{GLOBAL_CSS}</style>
      <Shell session={session} isAdmin={isAdmin} tab={tab} setTab={setTab} settings={settings} onLogout={() => setSession(null)}>
        {tab === "dashboard" && isAdmin && <Dashboard {...ctx} />}
        {tab === "sale" && <NewSale {...ctx} />}
        {tab === "mysales" && !isAdmin && <MySalesView {...ctx} />}
        {tab === "services" && isAdmin && <ServicesView {...ctx} />}
        {tab === "stock" && isAdmin && <StockView {...ctx} />}
        {tab === "purchases" && isAdmin && <PurchasesView {...ctx} />}
        {tab === "expenses" && isAdmin && <ExpensesView {...ctx} />}
        {tab === "reports" && isAdmin && <ReportsView {...ctx} />}
        {tab === "users" && isAdmin && <UsersView {...ctx} />}
        {tab === "settings" && isAdmin && <SettingsView {...ctx} />}
      </Shell>
      {receipt && <ReceiptModal sale={receipt} settings={settings} onClose={() => setReceipt(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  LOGIN — tap your name, enter your PIN. This is an in-app access gate
 *  only (there's no real backend yet), so it stops accidental taps, not a
 *  determined intruder. Good enough for a shared till; swap for real
 *  accounts once this moves onto a proper database.
 * ---------------------------------------------------------------------- */
function LoginScreen({ users, settings, onLogin }) {
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const press = (d) => {
    if (pin.length >= 6) return;
    setError("");
    setPin((p) => p + d);
  };
  const backspace = () => setPin((p) => p.slice(0, -1));

  const submit = () => {
    if (selected.pin === pin) { onLogin(selected); }
    else { setError("Incorrect PIN."); setPin(""); }
  };

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center px-6" style={{ minHeight: "100vh" }}>
        <img src={LOGO_DATA_URI} alt="Marrions Pharmacy" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", marginBottom: 14, boxShadow: "0 4px 14px rgba(0,0,0,.12)" }} />
        <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 21, fontWeight: 800, textAlign: "center" }}>{settings.name}</h1>
        <p style={{ fontSize: 12.5, color: SLATE, marginBottom: 26 }}>{settings.address}</p>
        <p style={{ fontSize: 12, color: SLATE, marginBottom: 12, fontWeight: 600 }}>Who's on the till?</p>
        <div className="flex flex-col gap-2" style={{ width: 300, maxWidth: "100%" }}>
          {users.map((u) => (
            <button key={u.id} onClick={() => setSelected(u)} className="focus-ring flex items-center gap-3" style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${LINE}`, background: PANEL, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFE3C8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: INK, flexShrink: 0 }}>
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: SLATE }}>{u.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6" style={{ minHeight: "100vh" }}>
      <button onClick={() => { setSelected(null); setPin(""); setError(""); }} className="focus-ring flex items-center gap-1" style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: SLATE, fontSize: 13, cursor: "pointer" }}>
        <ArrowLeft size={15} /> Back
      </button>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EFE3C8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: INK, marginBottom: 10 }}>
        {selected.name.slice(0, 2).toUpperCase()}
      </div>
      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selected.name}</p>
      <p style={{ fontSize: 11.5, color: SLATE, marginBottom: 20 }}>Enter your PIN</p>
      <div className="flex gap-2.5 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < pin.length ? INK : "#E7E1D3" }} />
        ))}
      </div>
      {error && <p style={{ fontSize: 12, color: RED, marginBottom: 10 }}>{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12 }}>
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button key={d} onClick={() => press(d)} className="focus-ring" style={{ width: 64, height: 64, borderRadius: "50%", border: `1px solid ${LINE}`, background: PANEL, fontSize: 18, fontWeight: 600, cursor: "pointer" }}>{d}</button>
        ))}
        <button onClick={backspace} className="focus-ring" style={{ width: 64, height: 64, borderRadius: "50%", border: "none", background: "none", fontSize: 13, color: SLATE, cursor: "pointer" }}>Del</button>
        <button onClick={() => press("0")} className="focus-ring" style={{ width: 64, height: 64, borderRadius: "50%", border: `1px solid ${LINE}`, background: PANEL, fontSize: 18, fontWeight: 600, cursor: "pointer" }}>0</button>
        <button onClick={submit} className="focus-ring" style={{ width: 64, height: 64, borderRadius: "50%", border: "none", background: INK, color: MARIGOLD, cursor: "pointer" }}><Check size={20} /></button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  SHELL
 * ---------------------------------------------------------------------- */
function Shell({ session, isAdmin, tab, setTab, settings, onLogout, children }) {
  const adminTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sale", label: "New Sale", icon: ShoppingCart },
    { id: "services", label: "Services", icon: Wrench },
    { id: "stock", label: "Stock", icon: Boxes },
    { id: "purchases", label: "Purchases", icon: Truck },
    { id: "expenses", label: "Expenses", icon: Wallet },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  const cashierTabs = [
    { id: "sale", label: "New Sale", icon: ShoppingCart },
    { id: "mysales", label: "My Sales", icon: ClipboardList },
  ];
  const tabs = isAdmin ? adminTabs : cashierTabs;

  return (
    <div className="flex flex-col" style={{ minHeight: "100vh" }}>
      <header style={{ background: INK, color: "#fff" }} className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={LOGO_DATA_URI} alt="Marrions Pharmacy" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: DISPLAY_FONT, fontSize: 15, fontWeight: 800, letterSpacing: 0.2 }}>{settings.name}</p>
            <p style={{ fontSize: 10.5, color: "#9FB0C6" }}>{settings.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{session.name}</div>
            <div style={{ fontSize: 10, color: "#9FB0C6" }}>{session.role}</div>
          </div>
          <button onClick={onLogout} className="focus-ring" title="Log out" style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1" style={{ paddingBottom: 76 }}>{children}</div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: PANEL, borderTop: `1px solid ${LINE}` }} className="flex">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="focus-ring flex-1 flex flex-col items-center gap-0.5" style={{ padding: "9px 2px 8px", background: "none", border: "none", cursor: "pointer", color: active ? INK : "#A79F8C" }}>
              <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
              <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{t.label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: MARIGOLD, marginTop: 1 }} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SectionCard({ children, style }) {
  return <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, marginBottom: 10, ...style }}>{children}</div>;
}
function EmptyState({ text }) {
  return <div style={{ padding: 28, textAlign: "center", border: `1px dashed ${LINE}`, borderRadius: 12 }}><p style={{ fontSize: 13, color: "#A79F8C" }}>{text}</p></div>;
}
function StatCard({ label, value, tone, sub }) {
  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px" }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</p>
      <p style={{ fontFamily: MONO_FONT, fontSize: 19, fontWeight: 700, color: tone || INK, marginTop: 3 }}>{value}</p>
      {sub && <p style={{ fontSize: 10.5, color: SLATE, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}
function Field({ label, children }) {
  return <label className="block mb-3"><span style={{ fontSize: 11, fontWeight: 700, color: SLATE, display: "block", marginBottom: 4 }}>{label}</span>{children}</label>;
}
const inputStyle = { width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5, background: "#fff" };
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,20,.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", padding: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="focus-ring" style={{ background: "none", border: "none", cursor: "pointer", color: SLATE }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ModalActions({ onCancel, onSave, saveLabel = "Save" }) {
  return (
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="focus-ring" style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: PANEL, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
      <button onClick={onSave} className="focus-ring" style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saveLabel}</button>
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  BARCODE SCANNER — opens the phone camera and decodes a barcode/QR
 *  using the device's back camera, then hands the raw text back up.
 * ---------------------------------------------------------------------- */
function BarcodeScannerModal({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let controls;
    const reader = new BrowserMultiFormatReader();
    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result && !cancelled) {
          cancelled = true;
          controls && controls.stop();
          onDetect(result.getText());
        }
      })
      .then((c) => { controls = c; })
      .catch(() => {
        if (!cancelled) setScanError("Couldn't access the camera. Check that this site has camera permission.");
      });
    return () => { cancelled = true; controls && controls.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,20,.9)", zIndex: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <p style={{ color: "#fff", fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>Point the camera at a barcode</p>
      <div style={{ width: "100%", maxWidth: 380, background: "#000", borderRadius: 16, overflow: "hidden", position: "relative" }}>
        <video ref={videoRef} style={{ width: "100%", display: "block" }} muted playsInline />
        <div style={{ position: "absolute", inset: 28, border: "2px solid #fff", borderRadius: 10, opacity: 0.55, pointerEvents: "none" }} />
      </div>
      {scanError && <p style={{ color: "#fff", fontSize: 12.5, marginTop: 14, textAlign: "center", maxWidth: 320 }}>{scanError}</p>}
      <button onClick={onClose} className="focus-ring" style={{ marginTop: 18, padding: "10px 22px", borderRadius: 9, border: "none", background: "#fff", color: INK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  NEW SALE — the hero screen. Big tappable tiles, a running cart, one
 *  Complete Sale action.
 * ---------------------------------------------------------------------- */
function NewSale({ services, items, session, completeSale, showReceipt }) {
  const [catalog, setCatalog] = useState("services");
  const [query, setQuery] = useState("");
  const [medQuery, setMedQuery] = useState("");
  const [cart, setCart] = useState([]); // { kind, refId, name, unitPrice, qty }
  const [payment, setPayment] = useState("Cash");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const catalogList = catalog === "services"
    ? services.filter((s) => s.active)
    : items.filter((i) => i.active);
  const filtered = catalogList.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const medMatches = medQuery.trim()
    ? items.filter((i) => i.active && i.name.toLowerCase().includes(medQuery.trim().toLowerCase())).slice(0, 8)
    : [];

  const addToCart = (entry) => {
    setError("");
    setCart((prev) => {
      const kind = catalog === "services" ? "service" : "item";
      const already = prev.find((l) => l.kind === kind && l.refId === entry.id);
      if (already) {
        return prev.map((l) => (l === already ? { ...l, qty: l.qty + 1 } : l));
      }
      const unitPrice = kind === "service" ? entry.price : entry.sellingPrice;
      return [...prev, { kind, refId: entry.id, name: entry.name, unitPrice, qty: 1 }];
    });
  };

  // Scanning always targets medicines/items (by barcode), regardless of
  // which catalog tab is currently active.
  const addItemToCart = (item) => {
    setError("");
    setCart((prev) => {
      const already = prev.find((l) => l.kind === "item" && l.refId === item.id);
      if (already) {
        return prev.map((l) => (l === already ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { kind: "item", refId: item.id, name: item.name, unitPrice: item.sellingPrice, qty: 1 }];
    });
  };

  const handleScan = (code) => {
    setShowScanner(false);
    const item = items.find((i) => i.barcode && i.barcode === code);
    if (!item) { setError(`No item matches barcode ${code}.`); return; }
    const isExpired = item.expiryDate && daysUntil(item.expiryDate) < 0;
    if (!item.active || item.stockQty <= 0 || isExpired) {
      setError(`${item.name} is out of stock.`);
      return;
    }
    addItemToCart(item);
  };

  const pickMedMatch = (item) => {
    const isExpired = item.expiryDate && daysUntil(item.expiryDate) < 0;
    if (item.stockQty <= 0 || isExpired) return;
    addItemToCart(item);
    setMedQuery("");
  };

  const setQty = (line, qty) => {
    if (qty <= 0) { setCart((prev) => prev.filter((l) => l !== line)); return; }
    setCart((prev) => prev.map((l) => (l === line ? { ...l, qty } : l)));
  };

  const total = cart.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  const complete = async () => {
    if (cart.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const lines = cart.map((l) => ({ kind: l.kind, refId: l.refId, name: l.name, qty: l.qty, unitPrice: l.unitPrice, subtotal: l.unitPrice * l.qty }));
      await completeSale(lines, payment);
      setCart([]);
    } catch (err) {
      setError(err.message || "Couldn't complete sale.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-4">
      {showScanner && <BarcodeScannerModal onDetect={handleScan} onClose={() => setShowScanner(false)} />}

      <p style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", marginBottom: 6 }}>Quick add medicine</p>
      <div className="relative mb-4">
        <Search size={15} color="#A79F8C" style={{ position: "absolute", left: 11, top: 10 }} />
        <input
          value={medQuery}
          onChange={(e) => setMedQuery(e.target.value)}
          placeholder="Search any medicine to add…"
          className="focus-ring"
          style={{ ...inputStyle, paddingLeft: 32, paddingRight: 42 }}
        />
        <button onClick={() => { setError(""); setShowScanner(true); }} className="focus-ring flex items-center justify-center" title="Scan barcode" style={{ position: "absolute", right: 4, top: 4, width: 34, height: 34, borderRadius: 8, border: "none", background: "none", color: INK, cursor: "pointer" }}>
          <Camera size={17} />
        </button>
        {medMatches.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,.12)", zIndex: 30, maxHeight: 280, overflowY: "auto" }}>
            {medMatches.map((it) => {
              const isExpired = it.expiryDate && daysUntil(it.expiryDate) < 0;
              const outOfStock = it.stockQty <= 0 || isExpired;
              return (
                <button
                  key={it.id}
                  onClick={() => pickMedMatch(it)}
                  disabled={outOfStock}
                  className="focus-ring flex items-center gap-2.5"
                  style={{ width: "100%", textAlign: "left", padding: "8px 12px", border: "none", borderBottom: `1px solid ${LINE}`, background: "none", cursor: outOfStock ? "not-allowed" : "pointer", opacity: outOfStock ? 0.5 : 1 }}
                >
                  {it.imageUrl
                    ? <img src={it.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 32, height: 32, borderRadius: 7, background: PAPER, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex justify-between">
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</span>
                      <span style={{ fontFamily: MONO_FONT, fontSize: 12.5, fontWeight: 700, color: MARIGOLD }}>{fmtKES(it.sellingPrice)}</span>
                    </div>
                    <span style={{ fontSize: 10.5, color: outOfStock ? RED : SLATE }}>{isExpired ? "Expired" : it.stockQty <= 0 ? "Out of stock" : `${it.stockQty} in stock`}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setCatalog("services")} className="focus-ring flex-1" style={{ padding: "9px 0", borderRadius: 10, border: "none", background: catalog === "services" ? INK : PANEL, color: catalog === "services" ? "#fff" : INK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Services</button>
        <button onClick={() => setCatalog("items")} className="focus-ring flex-1" style={{ padding: "9px 0", borderRadius: 10, border: "none", background: catalog === "items" ? INK : PANEL, color: catalog === "items" ? "#fff" : INK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Medicines</button>
      </div>

      <div className="relative mb-3">
        <Search size={15} color="#A79F8C" style={{ position: "absolute", left: 11, top: 10 }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${catalog}…`} className="focus-ring" style={{ ...inputStyle, paddingLeft: 32 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 90 }}>
        {filtered.map((c) => {
          const isItem = catalog === "items";
          const price = isItem ? c.sellingPrice : c.price;
          const isExpired = isItem && c.expiryDate && daysUntil(c.expiryDate) < 0;
          const outOfStock = isItem && (c.stockQty <= 0 || isExpired);
          const soonDays = isItem && c.expiryDate ? daysUntil(c.expiryDate) : null;
          return (
            <button
              key={c.id}
              onClick={() => !outOfStock && addToCart(c)}
              disabled={outOfStock}
              className="focus-ring"
              style={{ textAlign: "left", padding: 12, borderRadius: 12, border: `1px solid ${LINE}`, background: outOfStock ? "#F1EEE5" : PANEL, cursor: outOfStock ? "not-allowed" : "pointer", opacity: outOfStock ? 0.6 : 1 }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25, marginBottom: 6 }}>{c.name}</p>
              <p style={{ fontFamily: MONO_FONT, fontSize: 13.5, fontWeight: 700, color: MARIGOLD }}>{fmtKES(price)}</p>
              {isItem && <p style={{ fontSize: 10.5, color: isExpired ? RED : c.stockQty <= 0 ? RED : SLATE, marginTop: 2 }}>{isExpired ? "Expired" : c.stockQty <= 0 ? "Out of stock" : `${c.stockQty} in stock`}</p>}
              {isItem && !isExpired && soonDays != null && soonDays <= 30 && <p style={{ fontSize: 9.5, color: "#8A5A17", marginTop: 1 }}>Expires in {soonDays}d</p>}
            </button>
          );
        })}
        {filtered.length === 0 && <div style={{ gridColumn: "1 / -1" }}><EmptyState text="Nothing matches." /></div>}
      </div>

      {cart.length > 0 && (
        <div style={{ position: "fixed", bottom: 68, left: 0, right: 0, background: PANEL, borderTop: `1px solid ${LINE}`, borderRadius: "16px 16px 0 0", boxShadow: "0 -6px 24px rgba(0,0,0,.08)", maxHeight: "58vh", display: "flex", flexDirection: "column", zIndex: 20 }}>
          <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${LINE}` }}>
            <p style={{ fontWeight: 700, fontSize: 13.5 }}>Cart · {cart.length} item{cart.length > 1 ? "s" : ""}</p>
            <p style={{ fontFamily: MONO_FONT, fontWeight: 700, fontSize: 15, color: INK }}>{fmtKES(total)}</p>
          </div>
          <div className="px-4 py-2" style={{ overflowY: "auto", flex: 1 }}>
            {cart.map((l) => (
              <div key={`${l.kind}-${l.refId}`} className="flex items-center justify-between" style={{ padding: "7px 0", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</p>
                  <p style={{ fontFamily: MONO_FONT, fontSize: 11, color: SLATE }}>{fmtKES(l.unitPrice)} × {l.qty} = {fmtKES(l.unitPrice * l.qty)}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => setQty(l, l.qty - 1)} className="focus-ring" style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer" }}><Minus size={12} style={{ margin: "auto" }} /></button>
                  <span style={{ fontFamily: MONO_FONT, fontSize: 12.5, width: 18, textAlign: "center" }}>{l.qty}</span>
                  <button onClick={() => setQty(l, l.qty + 1)} className="focus-ring" style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer" }}><Plus size={12} style={{ margin: "auto" }} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3" style={{ borderTop: `1px solid ${LINE}` }}>
            <div className="flex gap-1.5 mb-2">
              {PAYMENT_METHODS.map((m) => (
                <button key={m} onClick={() => setPayment(m)} className="focus-ring" style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${payment === m ? "transparent" : LINE}`, background: payment === m ? INK : "#fff", color: payment === m ? "#fff" : INK, fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>{m}</button>
              ))}
            </div>
            {error && <p style={{ fontSize: 12, color: RED, marginBottom: 8 }}>{error}</p>}
            <button onClick={complete} disabled={busy} className="focus-ring" style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: MARIGOLD, color: INK, fontSize: 14, fontWeight: 800, cursor: busy ? "wait" : "pointer" }}>
              {busy ? "Completing…" : `Complete Sale · ${fmtKES(total)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  RECEIPT
 * ---------------------------------------------------------------------- */
function ReceiptModal({ sale, settings, onClose }) {
  const print = () => window.print();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,20,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: 320, maxHeight: "88vh", overflowY: "auto", padding: 20 }}>
        <div id="receipt-print" style={{ fontFamily: MONO_FONT, fontSize: 12, position: "relative" }}>
          <img src={LOGO_DATA_URI} alt="" aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 200, height: 200, objectFit: "contain", opacity: 0.08, pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>{settings.name}</p>
          <p style={{ textAlign: "center", marginBottom: 6 }}>{settings.address}</p>
          {settings.phone && <p style={{ textAlign: "center", marginBottom: 6 }}>{settings.phone}</p>}
          <p style={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", padding: "6px 0", margin: "8px 0" }}>
            Receipt No: {String(sale.receiptNo).padStart(6, "0")}<br />
            Date: {fmtDateTime(sale.createdAt)}<br />
            Served by: {sale.cashierName}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr><td style={{ paddingBottom: 4 }}>Description</td><td style={{ paddingBottom: 4, textAlign: "center" }}>Qty</td><td style={{ paddingBottom: 4, textAlign: "right" }}>Amount</td></tr>
            </thead>
            <tbody>
              {sale.lines.map((l, i) => (
                <tr key={i}>
                  <td style={{ padding: "2px 0" }}>{l.name}</td>
                  <td style={{ padding: "2px 0", textAlign: "center" }}>{l.qty}</td>
                  <td style={{ padding: "2px 0", textAlign: "right" }}>{fmtKES(l.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ borderTop: "1px dashed #999", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13.5 }}>
            <span>TOTAL:</span><span>{fmtKES(sale.total)}</span>
          </p>
          <p style={{ marginTop: 4 }}>Payment: {sale.paymentMethod}</p>
          <p style={{ textAlign: "center", marginTop: 12 }}>{settings.receiptFooter}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="focus-ring" style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>New Sale</button>
          <button onClick={print} className="focus-ring flex items-center justify-center gap-1.5" style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Printer size={14} /> Print</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  DASHBOARD
 * ---------------------------------------------------------------------- */
function Dashboard({ sales, expenses, items }) {
  const today = todayISO();
  const todaySales = sales.filter((s) => s.createdAt.slice(0, 10) === today);
  const todayExpenses = expenses.filter((e) => e.date === today);
  const salesTotal = todaySales.reduce((s, x) => s + x.total, 0);
  const expensesTotal = todayExpenses.reduce((s, x) => s + Number(x.amount), 0);

  const cogsToday = todaySales.reduce((sum, s) => sum + s.lines.reduce((ls, l) => {
    if (l.kind !== "item") return ls;
    const item = items.find((i) => i.id === l.refId);
    return ls + (item ? item.buyingPrice * l.qty : 0);
  }, 0), 0);
  const grossProfit = salesTotal - cogsToday;
  const netProfit = grossProfit - expensesTotal;

  const byMethod = {};
  todaySales.forEach((s) => { byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.total; });

  let servicesSold = 0, itemsSold = 0;
  todaySales.forEach((s) => s.lines.forEach((l) => { if (l.kind === "service") servicesSold += l.qty; else itemsSold += l.qty; }));

  const lowStock = items.filter((i) => i.active && i.stockQty <= i.reorderLevel);
  const stockValue = items.reduce((s, i) => s + i.stockQty * i.buyingPrice, 0);
  const expired = items.filter((i) => i.active && i.expiryDate && daysUntil(i.expiryDate) < 0);
  const expiringSoon = items.filter((i) => i.active && i.expiryDate && daysUntil(i.expiryDate) >= 0 && daysUntil(i.expiryDate) <= 30);

  return (
    <div className="px-4 py-4">
      <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 18, fontWeight: 800, marginBottom: 2 }}>Today</h2>
      <p style={{ fontSize: 12, color: SLATE, marginBottom: 12 }}>{fmtDate(today)}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <StatCard label="Sales" value={fmtKES(salesTotal)} />
        <StatCard label="Expenses" value={fmtKES(expensesTotal)} tone={RED} />
        <StatCard label="Net Profit" value={fmtKES(netProfit)} tone={netProfit >= 0 ? GREEN : RED} />
        <StatCard label="Stock Value" value={fmtKES(stockValue)} />
      </div>

      <SectionCard>
        <p style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", marginBottom: 8 }}>By payment method</p>
        {PAYMENT_METHODS.map((m) => byMethod[m] ? (
          <div key={m} className="flex justify-between" style={{ padding: "4px 0", fontSize: 13 }}>
            <span>{m}</span><span style={{ fontFamily: MONO_FONT, fontWeight: 600 }}>{fmtKES(byMethod[m])}</span>
          </div>
        ) : null)}
        {Object.keys(byMethod).length === 0 && <p style={{ fontSize: 12.5, color: "#A79F8C" }}>No sales yet today.</p>}
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <StatCard label="Services sold" value={servicesSold} />
        <StatCard label="Items sold" value={itemsSold} />
      </div>

      {expired.length > 0 && (
        <SectionCard style={{ background: "#FBE3DC", border: "1px solid #EBBBA9" }}>
          <p className="flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: RED, marginBottom: 6 }}><AlertTriangle size={14} /> Expired — remove from shelf</p>
          {expired.map((i) => (
            <p key={i.id} style={{ fontSize: 12.5, color: "#8C3220" }}>⚠️ {i.name} — expired {fmtDate(i.expiryDate)}</p>
          ))}
        </SectionCard>
      )}

      {expiringSoon.length > 0 && (
        <SectionCard style={{ background: "#FBEFE2", border: "1px solid #F0D9B5" }}>
          <p className="flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: "#8A5A17", marginBottom: 6 }}><AlertTriangle size={14} /> Expiring within 30 days</p>
          {expiringSoon.map((i) => (
            <p key={i.id} style={{ fontSize: 12.5, color: "#6b5730" }}>⚠️ {i.name} — expires {fmtDate(i.expiryDate)} ({daysUntil(i.expiryDate)}d)</p>
          ))}
        </SectionCard>
      )}

      {lowStock.length > 0 && (
        <SectionCard style={{ background: "#FBEFE2", border: "1px solid #F0D9B5" }}>
          <p className="flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: "#8A5A17", marginBottom: 6 }}><AlertTriangle size={14} /> Low stock</p>
          {lowStock.map((i) => (
            <p key={i.id} style={{ fontSize: 12.5, color: "#6b5730" }}>⚠️ Low Stock: {i.name} — {i.stockQty} remaining</p>
          ))}
        </SectionCard>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  SERVICES
 * ---------------------------------------------------------------------- */
function ServicesView({ services, update }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "" });

  const openNew = () => { setForm({ name: "", price: "" }); setEditing(null); setShowForm(true); };
  const openEdit = (s) => { setForm({ name: s.name, price: s.price }); setEditing(s.id); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim() || form.price === "") return;
    if (editing) {
      await update.services(services.map((s) => (s.id === editing ? { ...s, name: form.name, price: Number(form.price) } : s)));
    } else {
      await update.services([...services, { id: uid(), name: form.name, price: Number(form.price), active: true }]);
    }
    setShowForm(false);
  };
  const toggleActive = async (s) => update.services(services.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)));
  const remove = async (id) => update.services(services.filter((s) => s.id !== id));

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800 }}>Services ({services.length})</h2>
        <button onClick={openNew} className="focus-ring flex items-center gap-1.5" style={{ padding: "8px 13px", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Add</button>
      </div>
      {services.length === 0 && <EmptyState text="No services yet." />}
      {services.map((s) => (
        <SectionCard key={s.id}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight: 600, fontSize: 13.5, opacity: s.active ? 1 : 0.45 }}>{s.name}</p>
              <p style={{ fontFamily: MONO_FONT, fontSize: 13, color: MARIGOLD, marginTop: 2 }}>{fmtKES(s.price)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => toggleActive(s)} className="focus-ring" style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 8px", borderRadius: 999, border: "none", background: s.active ? "#E3F0EA" : "#F1EEE5", color: s.active ? GREEN : "#A79F8C", cursor: "pointer", marginRight: 4 }}>{s.active ? "Active" : "Hidden"}</button>
              <button onClick={() => openEdit(s)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: SLATE, cursor: "pointer" }}><Pencil size={14} /></button>
              <button onClick={() => remove(s.id)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: RED, cursor: "pointer" }}><Trash2 size={14} /></button>
            </div>
          </div>
        </SectionCard>
      ))}
      {showForm && (
        <Modal title={editing ? "Edit service" : "Add service"} onClose={() => setShowForm(false)}>
          <Field label="Service name"><input className="focus-ring" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Price (Ksh)"><input type="number" className="focus-ring" style={inputStyle} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
          <ModalActions onCancel={() => setShowForm(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  STOCK / ITEMS
 * ---------------------------------------------------------------------- */
function StockView({ items, update, restocks, settings }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [restockFor, setRestockFor] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [scanningForForm, setScanningForForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  function blankForm() { return { name: "", buyingPrice: "", sellingPrice: "", stockQty: "", reorderLevel: "", expiryDate: "", barcode: "", imageUrl: "" }; }

  const openNew = () => { setForm(blankForm()); setEditing(null); setImageError(""); setShowForm(true); };
  const openEdit = (i) => { setForm({ name: i.name, buyingPrice: i.buyingPrice, sellingPrice: i.sellingPrice, stockQty: i.stockQty, reorderLevel: i.reorderLevel, expiryDate: i.expiryDate || "", barcode: i.barcode || "", imageUrl: i.imageUrl || "" }); setEditing(i.id); setImageError(""); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, buyingPrice: Number(form.buyingPrice) || 0, sellingPrice: Number(form.sellingPrice) || 0, stockQty: Number(form.stockQty) || 0, reorderLevel: Number(form.reorderLevel) || 0, expiryDate: form.expiryDate || "", barcode: form.barcode.trim() || "", imageUrl: form.imageUrl || "" };
    if (editing) {
      await update.items(items.map((i) => (i.id === editing ? { ...i, ...payload } : i)));
    } else {
      await update.items([...items, { id: uid(), ...payload, active: true }]);
    }
    setShowForm(false);
  };
  const toggleActive = async (i) => update.items(items.map((x) => (x.id === i.id ? { ...x, active: !x.active } : x)));
  const remove = async (id) => update.items(items.filter((i) => i.id !== id));

  const handleImagePick = async (file) => {
    if (!file) return;
    setImageError("");
    setUploadingImage(true);
    try {
      const tempId = editing || `new-${uid()}`;
      const url = await db.uploadItemImage(tempId, file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (e) {
      setImageError(e.message || "Couldn't upload the picture.");
    } finally {
      setUploadingImage(false);
    }
  };

  const doRestock = async (item, qty, cost, note, expiryDate) => {
    await update.items(items.map((i) => (i.id === item.id ? { ...i, stockQty: i.stockQty + qty, ...(cost ? { buyingPrice: cost } : {}), ...(expiryDate ? { expiryDate } : {}) } : i)));
    await update.restocks([...restocks, { id: uid(), itemId: item.id, itemName: item.name, qty, cost: cost || item.buyingPrice, date: todayISO(), note }]);
    setRestockFor(null);
  };

  const printStockList = () => {
    const rows = items.map((i) => {
      const low = i.stockQty <= i.reorderLevel;
      return `<tr>
        <td>${i.name}${i.active ? "" : " (inactive)"}</td>
        <td style="text-align:right">${fmtKES(i.buyingPrice)}</td>
        <td style="text-align:right">${fmtKES(i.sellingPrice)}</td>
        <td style="text-align:right;${low ? "color:#B3261E;font-weight:700;" : ""}">${i.stockQty}</td>
        <td style="text-align:right">${i.reorderLevel}</td>
        <td>${i.expiryDate ? fmtDate(i.expiryDate) : "—"}</td>
      </tr>`;
    }).join("");
    const html = `<!doctype html><html><head><title>Stock List - ${settings.name}</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #1a1a1a; }
        h1 { font-size: 18px; margin: 0 0 2px; }
        p.sub { font-size: 12px; color: #555; margin: 0 0 18px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border-bottom: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f3f3f3; }
        @media print { @page { margin: 14mm; } }
      </style>
      </head><body>
        <h1>${settings.name}</h1>
        <p class="sub">${settings.address || ""}${settings.address ? " · " : ""}Stock list printed ${fmtDateTime(new Date().toISOString())} · ${items.length} items</p>
        <table>
          <thead><tr><th>Item</th><th>Buy</th><th>Sell</th><th>Qty</th><th>Reorder</th><th>Expiry</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow pop-ups for this site to print the stock list."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3" style={{ flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800 }}>Stock ({items.length})</h2>
        <div className="flex items-center gap-1.5">
          <button onClick={printStockList} className="focus-ring flex items-center gap-1.5" style={{ padding: "8px 13px", borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", color: INK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Printer size={14} /> Print / Save PDF</button>
          <button onClick={openNew} className="focus-ring flex items-center gap-1.5" style={{ padding: "8px 13px", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Add item</button>
        </div>
      </div>
      {items.length === 0 && <EmptyState text="No items yet." />}
      {items.map((i) => {
        const low = i.stockQty <= i.reorderLevel;
        const dLeft = daysUntil(i.expiryDate);
        const expired = dLeft != null && dLeft < 0;
        const expiringSoon = dLeft != null && dLeft >= 0 && dLeft <= 30;
        return (
          <SectionCard key={i.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                {i.imageUrl
                  ? <img src={i.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 9, objectFit: "cover", flexShrink: 0, opacity: i.active ? 1 : 0.45, border: `1px solid ${LINE}` }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 9, background: PAPER, border: `1px dashed ${LINE}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><ImagePlus size={16} color="#C9C1AC" /></div>}
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13.5, opacity: i.active ? 1 : 0.45 }}>{i.name}</p>
                  <p style={{ fontSize: 11.5, color: SLATE, marginTop: 2 }}>Buy {fmtKES(i.buyingPrice)} · Sell {fmtKES(i.sellingPrice)}</p>
                  <p style={{ fontFamily: MONO_FONT, fontSize: 12.5, marginTop: 3, color: low ? RED : INK, fontWeight: 600 }}>
                    {low && "⚠️ "}{i.stockQty} in stock {low && `(reorder at ${i.reorderLevel})`}
                  </p>
                  {i.expiryDate && (
                    <p style={{ fontSize: 11.5, marginTop: 2, color: expired ? RED : expiringSoon ? "#8A5A17" : SLATE, fontWeight: expired || expiringSoon ? 700 : 400 }}>
                      {expired ? "⚠️ Expired " : expiringSoon ? "⚠️ Expires " : "Expires "}{fmtDate(i.expiryDate)}{expiringSoon && ` (${dLeft}d)`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(i)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: SLATE, cursor: "pointer" }}><Pencil size={14} /></button>
                <button onClick={() => remove(i.id)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: RED, cursor: "pointer" }}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setRestockFor(i)} className="focus-ring" style={{ fontSize: 11.5, fontWeight: 600, padding: "6px 11px", borderRadius: 8, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer" }}>Restock</button>
              <button onClick={() => toggleActive(i)} className="focus-ring" style={{ fontSize: 11.5, fontWeight: 600, padding: "6px 11px", borderRadius: 8, border: "none", background: i.active ? "#E3F0EA" : "#F1EEE5", color: i.active ? GREEN : "#A79F8C", cursor: "pointer" }}>{i.active ? "Active" : "Hidden"}</button>
            </div>
          </SectionCard>
        );
      })}
      {showForm && (
        <Modal title={editing ? "Edit item" : "Add item"} onClose={() => setShowForm(false)}>
          <Field label="Item name"><input className="focus-ring" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="flex gap-3">
            <Field label="Buying price"><input type="number" className="focus-ring" style={inputStyle} value={form.buyingPrice} onChange={(e) => setForm({ ...form, buyingPrice: e.target.value })} /></Field>
            <Field label="Selling price"><input type="number" className="focus-ring" style={inputStyle} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></Field>
          </div>
          <div className="flex gap-3">
            <Field label="Stock quantity"><input type="number" className="focus-ring" style={inputStyle} value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} /></Field>
            <Field label="Reorder level"><input type="number" className="focus-ring" style={inputStyle} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} /></Field>
          </div>
          <Field label="Expiry date (optional)"><input type="date" className="focus-ring" style={inputStyle} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></Field>
          <Field label="Barcode (optional)">
            <div className="flex gap-2">
              <input className="focus-ring" style={{ ...inputStyle, flex: 1 }} value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Scan or type barcode" />
              <button type="button" onClick={() => setScanningForForm(true)} className="focus-ring flex items-center justify-center" title="Scan barcode" style={{ width: 42, borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", color: INK, cursor: "pointer", flexShrink: 0 }}>
                <Camera size={16} />
              </button>
            </div>
          </Field>
          <Field label="Picture (optional)">
            <div className="flex items-center gap-3">
              {form.imageUrl
                ? <img src={form.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: `1px solid ${LINE}` }} />
                : <div style={{ width: 56, height: 56, borderRadius: 10, background: "#fff", border: `1px dashed ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center" }}><ImagePlus size={20} color="#C9C1AC" /></div>}
              <div>
                <label className="focus-ring" style={{ display: "inline-block", padding: "7px 12px", borderRadius: 8, border: `1px solid ${LINE}`, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {uploadingImage ? "Uploading…" : form.imageUrl ? "Change photo" : "Add photo"}
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} disabled={uploadingImage} onChange={(e) => handleImagePick(e.target.files?.[0])} />
                </label>
                {form.imageUrl && !uploadingImage && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))} className="focus-ring" style={{ marginLeft: 8, fontSize: 11.5, color: RED, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                )}
                {imageError && <p style={{ fontSize: 11, color: RED, marginTop: 4 }}>{imageError}</p>}
              </div>
            </div>
          </Field>
          <ModalActions onCancel={() => setShowForm(false)} onSave={save} />
        </Modal>
      )}
      {scanningForForm && (
        <BarcodeScannerModal
          onDetect={(code) => { setForm((f) => ({ ...f, barcode: code })); setScanningForForm(false); }}
          onClose={() => setScanningForForm(false)}
        />
      )}
      {restockFor && <RestockModal item={restockFor} onClose={() => setRestockFor(null)} onSave={doRestock} />}
    </div>
  );
}

function RestockModal({ item, onClose, onSave }) {
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState(item.buyingPrice);
  const [expiryDate, setExpiryDate] = useState(item.expiryDate || "");
  const [note, setNote] = useState("");
  const save = () => { if (Number(qty) > 0) onSave(item, Number(qty), Number(cost) || item.buyingPrice, note, expiryDate); };
  return (
    <Modal title={`Restock — ${item.name}`} onClose={onClose}>
      <Field label="Quantity received"><input type="number" className="focus-ring" style={inputStyle} value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
      <Field label="Buying price (Ksh, optional update)"><input type="number" className="focus-ring" style={inputStyle} value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
      <Field label="New expiry date (optional)"><input type="date" className="focus-ring" style={inputStyle} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></Field>
      <Field label="Note (optional)"><input className="focus-ring" style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <ModalActions onCancel={onClose} onSave={save} saveLabel="Add stock" />
    </Modal>
  );
}

/* ---------------------------------------------------------------------- *
 *  PURCHASES — vendors, purchase orders, and WhatsApp invoices.
 * ---------------------------------------------------------------------- */
function cleanPhoneForWhatsapp(phone) {
  let digits = (phone || "").replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = "254" + digits.slice(1); // Kenyan local -> international
  return digits;
}

function PurchasesView({ items, vendors, purchaseOrders, settings, update }) {
  const [subTab, setSubTab] = useState("new");
  const [invoiceFor, setInvoiceFor] = useState(null);

  // --- Vendors ---
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const openNewVendor = () => { setVendorForm({ name: "", phone: "", address: "", notes: "" }); setEditingVendor(null); setShowVendorForm(true); };
  const openEditVendor = (v) => { setVendorForm({ name: v.name, phone: v.phone, address: v.address || "", notes: v.notes || "" }); setEditingVendor(v.id); setShowVendorForm(true); };
  const saveVendor = async () => {
    if (!vendorForm.name.trim() || !vendorForm.phone.trim()) return;
    if (editingVendor) {
      await update.vendors(vendors.map((v) => (v.id === editingVendor ? { ...v, ...vendorForm } : v)));
    } else {
      await update.vendors([...vendors, { id: uid(), ...vendorForm }]);
    }
    setShowVendorForm(false);
  };
  const removeVendor = async (id) => update.vendors(vendors.filter((v) => v.id !== id));

  // --- New purchase order ---
  const [vendorId, setVendorId] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [poLines, setPoLines] = useState([]); // { itemId, itemName, qty, cost }
  const [poNotes, setPoNotes] = useState("");
  const [poError, setPoError] = useState("");

  const itemMatches = itemQuery.trim()
    ? items.filter((i) => i.active && i.name.toLowerCase().includes(itemQuery.trim().toLowerCase())).slice(0, 8)
    : [];

  const addLine = (item) => {
    setItemQuery("");
    setPoLines((prev) => {
      if (prev.find((l) => l.itemId === item.id)) return prev;
      return [...prev, { itemId: item.id, itemName: item.name, qty: 1, cost: item.buyingPrice }];
    });
  };
  const updateLine = (itemId, patch) => setPoLines((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, ...patch } : l)));
  const removeLine = (itemId) => setPoLines((prev) => prev.filter((l) => l.itemId !== itemId));
  const poTotal = poLines.reduce((s, l) => s + Number(l.qty || 0) * Number(l.cost || 0), 0);

  const resetPoForm = () => { setVendorId(""); setPoLines([]); setPoNotes(""); setPoError(""); };

  const createPO = async () => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) { setPoError("Choose a vendor."); return; }
    if (poLines.length === 0) { setPoError("Add at least one item."); return; }
    setPoError("");
    const lines = poLines.map((l) => ({ itemId: l.itemId, itemName: l.itemName, qty: Number(l.qty) || 0, cost: Number(l.cost) || 0, subtotal: (Number(l.qty) || 0) * (Number(l.cost) || 0) }));
    const po = {
      id: uid(),
      poNumber: settings.nextPoNo,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      lines,
      total: lines.reduce((s, l) => s + l.subtotal, 0),
      notes: poNotes,
      createdAt: new Date().toISOString(),
    };
    await update.purchaseOrders([...purchaseOrders, po]);
    await update.settings({ ...settings, nextPoNo: settings.nextPoNo + 1 });
    resetPoForm();
    setInvoiceFor(po);
  };

  // --- Invoice: WhatsApp text + printable PDF ---
  const invoiceText = (po) => {
    const lines = po.lines.map((l) => `• ${l.itemName} — ${l.qty} x ${fmtKES(l.cost)} = ${fmtKES(l.subtotal)}`).join("\n");
    return `*Purchase Order #${String(po.poNumber).padStart(4, "0")}*\n${settings.name}\n${settings.address || ""}\n\nTo: ${po.vendorName}\nDate: ${fmtDate(po.createdAt.slice(0, 10))}\n\n${lines}\n\n*Total: ${fmtKES(po.total)}*${po.notes ? `\n\nNote: ${po.notes}` : ""}`;
  };

  const sendViaWhatsapp = (po) => {
    const phone = cleanPhoneForWhatsapp(po.vendorPhone);
    const text = encodeURIComponent(invoiceText(po));
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  const printInvoice = (po) => {
    const rows = po.lines.map((l) => `<tr><td>${l.itemName}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${fmtKES(l.cost)}</td><td style="text-align:right">${fmtKES(l.subtotal)}</td></tr>`).join("");
    const html = `<!doctype html><html><head><title>PO #${po.poNumber} - ${settings.name}</title>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 28px; color: #1a1a1a; }
        h1 { font-size: 19px; margin: 0 0 2px; }
        p.sub { font-size: 12px; color: #555; margin: 0 0 4px; }
        .row { display: flex; justify-content: space-between; margin: 18px 0 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-top: 6px; }
        th, td { border-bottom: 1px solid #ddd; padding: 7px 8px; text-align: left; }
        th { background: #f3f3f3; }
        .total { text-align: right; font-size: 14px; font-weight: 700; margin-top: 10px; }
        @media print { @page { margin: 16mm; } }
      </style>
      </head><body>
        <h1>${settings.name}</h1>
        <p class="sub">${settings.address || ""}${settings.phone ? " · " + settings.phone : ""}</p>
        <div class="row">
          <div><strong>Purchase Order #${String(po.poNumber).padStart(4, "0")}</strong><br/>Date: ${fmtDate(po.createdAt.slice(0, 10))}</div>
          <div style="text-align:right"><strong>Vendor</strong><br/>${po.vendorName}<br/>${po.vendorPhone || ""}</div>
        </div>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Unit cost</th><th>Subtotal</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="total">Total: ${fmtKES(po.total)}</p>
        ${po.notes ? `<p style="font-size:12px;color:#555;margin-top:12px;">Note: ${po.notes}</p>` : ""}
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow pop-ups to print the invoice."); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="px-4 py-4">
      <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800, marginBottom: 10 }}>Purchases</h2>

      <div className="flex gap-2 mb-4">
        {[{ id: "new", label: "New Order" }, { id: "history", label: "History" }, { id: "vendors", label: "Vendors" }].map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)} className="focus-ring flex-1" style={{ padding: "9px 0", borderRadius: 10, border: "none", background: subTab === t.id ? INK : PANEL, color: subTab === t.id ? "#fff" : INK, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>

      {subTab === "vendors" && (
        <>
          <button onClick={openNewVendor} className="focus-ring flex items-center gap-1.5" style={{ marginBottom: 12, padding: "8px 13px", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Add vendor</button>
          {vendors.length === 0 && <EmptyState text="No vendors yet." />}
          {vendors.map((v) => (
            <SectionCard key={v.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</p>
                  <p style={{ fontSize: 11.5, color: SLATE, marginTop: 2 }}>{v.phone}</p>
                  {v.address && <p style={{ fontSize: 11.5, color: SLATE, marginTop: 1 }}>{v.address}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditVendor(v)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: SLATE, cursor: "pointer" }}><Pencil size={14} /></button>
                  <button onClick={() => removeVendor(v.id)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: RED, cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>
            </SectionCard>
          ))}
        </>
      )}

      {subTab === "new" && (
        <>
          <Field label="Vendor">
            <select className="focus-ring" style={inputStyle} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">Select a vendor…</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          {vendors.length === 0 && <p style={{ fontSize: 11.5, color: SLATE, marginTop: -6, marginBottom: 12 }}>No vendors saved yet — add one in the Vendors tab first.</p>}

          <div className="relative mb-3">
            <Search size={15} color="#A79F8C" style={{ position: "absolute", left: 11, top: 10 }} />
            <input value={itemQuery} onChange={(e) => setItemQuery(e.target.value)} placeholder="Search medicine to add to order…" className="focus-ring" style={{ ...inputStyle, paddingLeft: 32 }} />
            {itemMatches.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,.12)", zIndex: 30, maxHeight: 260, overflowY: "auto" }}>
                {itemMatches.map((it) => (
                  <button key={it.id} onClick={() => addLine(it)} className="focus-ring" style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", borderBottom: `1px solid ${LINE}`, background: "none", cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</span>
                    <span style={{ fontSize: 10.5, color: SLATE, display: "block" }}>Usual buy price {fmtKES(it.buyingPrice)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {poLines.length === 0 && <EmptyState text="Search above to add items to this order." />}
          {poLines.map((l) => (
            <SectionCard key={l.itemId}>
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontWeight: 600, fontSize: 13 }}>{l.itemName}</p>
                <button onClick={() => removeLine(l.itemId)} className="focus-ring" style={{ padding: 4, background: "none", border: "none", color: RED, cursor: "pointer" }}><Trash2 size={14} /></button>
              </div>
              <div className="flex gap-3">
                <Field label="Qty"><input type="number" min="1" className="focus-ring" style={inputStyle} value={l.qty} onChange={(e) => updateLine(l.itemId, { qty: e.target.value })} /></Field>
                <Field label="Unit cost"><input type="number" className="focus-ring" style={inputStyle} value={l.cost} onChange={(e) => updateLine(l.itemId, { cost: e.target.value })} /></Field>
              </div>
              <p style={{ fontFamily: MONO_FONT, fontSize: 12.5, fontWeight: 700, textAlign: "right" }}>{fmtKES(Number(l.qty || 0) * Number(l.cost || 0))}</p>
            </SectionCard>
          ))}

          {poLines.length > 0 && (
            <>
              <Field label="Note to vendor (optional)"><input className="focus-ring" style={inputStyle} value={poNotes} onChange={(e) => setPoNotes(e.target.value)} /></Field>
              <div className="flex justify-between items-center" style={{ margin: "10px 0 14px" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: MONO_FONT, fontSize: 18, fontWeight: 800 }}>{fmtKES(poTotal)}</span>
              </div>
              {poError && <p style={{ fontSize: 12, color: RED, marginBottom: 10 }}>{poError}</p>}
              <button onClick={createPO} className="focus-ring" style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: MARIGOLD, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 90 }}>Save & Prepare Invoice</button>
            </>
          )}
        </>
      )}

      {subTab === "history" && (
        <>
          {purchaseOrders.length === 0 && <EmptyState text="No purchase orders yet." />}
          {[...purchaseOrders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((po) => (
            <button key={po.id} onClick={() => setInvoiceFor(po)} className="focus-ring" style={{ width: "100%", textAlign: "left", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer" }}>
              <div className="flex justify-between">
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600 }}>PO #{String(po.poNumber).padStart(4, "0")} · {po.vendorName}</p>
                  <p style={{ fontSize: 11, color: SLATE, marginTop: 1 }}>{fmtDateTime(po.createdAt)} · {po.lines.length} items</p>
                </div>
                <p style={{ fontFamily: MONO_FONT, fontWeight: 700 }}>{fmtKES(po.total)}</p>
              </div>
            </button>
          ))}
        </>
      )}

      {showVendorForm && (
        <Modal title={editingVendor ? "Edit vendor" : "Add vendor"} onClose={() => setShowVendorForm(false)}>
          <Field label="Vendor / supplier name"><input className="focus-ring" style={inputStyle} value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /></Field>
          <Field label="WhatsApp phone number"><input className="focus-ring" style={inputStyle} placeholder="e.g. 0712345678" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} /></Field>
          <Field label="Address (optional)"><input className="focus-ring" style={inputStyle} value={vendorForm.address} onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })} /></Field>
          <Field label="Notes (optional)"><input className="focus-ring" style={inputStyle} value={vendorForm.notes} onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })} /></Field>
          <ModalActions onCancel={() => setShowVendorForm(false)} onSave={saveVendor} />
        </Modal>
      )}

      {invoiceFor && (
        <Modal title={`Purchase Order #${String(invoiceFor.poNumber).padStart(4, "0")}`} onClose={() => setInvoiceFor(null)}>
          <p style={{ fontSize: 12.5, color: SLATE, marginBottom: 2 }}>To: <strong style={{ color: INK }}>{invoiceFor.vendorName}</strong> · {invoiceFor.vendorPhone}</p>
          <p style={{ fontSize: 11.5, color: SLATE, marginBottom: 12 }}>{fmtDateTime(invoiceFor.createdAt)}</p>
          {invoiceFor.lines.map((l) => (
            <div key={l.itemId} className="flex justify-between" style={{ padding: "6px 0", borderBottom: `1px solid ${LINE}` }}>
              <span style={{ fontSize: 12.5 }}>{l.itemName} <span style={{ color: SLATE }}>x{l.qty}</span></span>
              <span style={{ fontFamily: MONO_FONT, fontSize: 12.5, fontWeight: 600 }}>{fmtKES(l.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between" style={{ marginTop: 10, marginBottom: 16 }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: MONO_FONT, fontWeight: 800, fontSize: 15 }}>{fmtKES(invoiceFor.total)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => sendViaWhatsapp(invoiceFor)} className="focus-ring flex items-center justify-center gap-1.5" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#25D366", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}><MessageCircle size={16} /> WhatsApp</button>
            <button onClick={() => printInvoice(invoiceFor)} className="focus-ring flex items-center justify-center gap-1.5" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: "#fff", color: INK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}><Printer size={16} /> Print / PDF</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  EXPENSES
 * ---------------------------------------------------------------------- */
function ExpensesView({ expenses, update, session }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", date: todayISO() });
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  const save = async () => {
    if (!form.description.trim() || !form.amount) return;
    await update.expenses([...expenses, { id: uid(), description: form.description, amount: Number(form.amount), date: form.date, recordedBy: session.name }]);
    setShowForm(false);
    setForm({ description: "", amount: "", date: todayISO() });
  };
  const remove = async (id) => update.expenses(expenses.filter((e) => e.id !== id));

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800 }}>Expenses</h2>
        <button onClick={() => setShowForm(true)} className="focus-ring flex items-center gap-1.5" style={{ padding: "8px 13px", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Add</button>
      </div>
      {sorted.length === 0 && <EmptyState text="No expenses recorded yet." />}
      {sorted.map((e) => (
        <SectionCard key={e.id}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight: 600, fontSize: 13.5 }}>{e.description}</p>
              <p style={{ fontSize: 11.5, color: SLATE, marginTop: 2 }}>{fmtDate(e.date)} · {e.recordedBy}</p>
            </div>
            <div className="flex items-center gap-2">
              <p style={{ fontFamily: MONO_FONT, fontWeight: 700, color: RED }}>{fmtKES(e.amount)}</p>
              <button onClick={() => remove(e.id)} className="focus-ring" style={{ padding: 4, background: "none", border: "none", color: RED, cursor: "pointer" }}><Trash2 size={13} /></button>
            </div>
          </div>
        </SectionCard>
      ))}
      {showForm && (
        <Modal title="Add expense" onClose={() => setShowForm(false)}>
          <Field label="Description"><input className="focus-ring" style={inputStyle} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Amount (Ksh)"><input type="number" className="focus-ring" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
          <Field label="Date"><input type="date" className="focus-ring" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <ModalActions onCancel={() => setShowForm(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  REPORTS
 * ---------------------------------------------------------------------- */
function ReportsView({ sales, expenses, items, deleteSale }) {
  const [range, setRange] = useState("today");
  const [customFrom, setCustomFrom] = useState(todayISO());
  const [customTo, setCustomTo] = useState(todayISO());

  const { from, to } = useMemo(() => {
    const now = new Date();
    const t = todayISO();
    if (range === "today") return { from: t, to: t };
    if (range === "week") {
      const d = new Date(now); const day = d.getDay(); const diff = (day === 0 ? 6 : day - 1);
      d.setDate(d.getDate() - diff);
      return { from: d.toISOString().slice(0, 10), to: t };
    }
    if (range === "month") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: d.toISOString().slice(0, 10), to: t };
    }
    return { from: customFrom, to: customTo };
  }, [range, customFrom, customTo]);

  const filteredSales = sales.filter((s) => inRange(s.createdAt, from, to));
  const filteredExpenses = expenses.filter((e) => e.date >= from && e.date <= to);
  const salesTotal = filteredSales.reduce((s, x) => s + x.total, 0);
  const expensesTotal = filteredExpenses.reduce((s, x) => s + Number(x.amount), 0);
  const cogs = filteredSales.reduce((sum, s) => sum + s.lines.reduce((ls, l) => {
    if (l.kind !== "item") return ls;
    const item = items.find((i) => i.id === l.refId);
    return ls + (item ? item.buyingPrice * l.qty : 0);
  }, 0), 0);
  const netProfit = salesTotal - cogs - expensesTotal;
  const byMethod = {};
  filteredSales.forEach((s) => { byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] || 0) + s.total; });

  return (
    <div className="px-4 py-4">
      <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800, marginBottom: 10 }}>Reports</h2>
      <div className="flex gap-1.5 mb-3" style={{ flexWrap: "wrap" }}>
        {[["today", "Today"], ["week", "This Week"], ["month", "This Month"], ["custom", "Custom"]].map(([k, label]) => (
          <button key={k} onClick={() => setRange(k)} className="focus-ring" style={{ padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1px solid ${range === k ? "transparent" : LINE}`, background: range === k ? INK : "#fff", color: range === k ? "#fff" : INK, cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      {range === "custom" && (
        <div className="flex gap-2 mb-3">
          <input type="date" className="focus-ring" style={inputStyle} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          <input type="date" className="focus-ring" style={inputStyle} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <StatCard label="Sales" value={fmtKES(salesTotal)} />
        <StatCard label="Expenses" value={fmtKES(expensesTotal)} tone={RED} />
        <StatCard label="Net Profit" value={fmtKES(netProfit)} tone={netProfit >= 0 ? GREEN : RED} />
        <StatCard label="Transactions" value={filteredSales.length} />
      </div>

      <SectionCard>
        <p style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", marginBottom: 8 }}>By payment method</p>
        {Object.keys(byMethod).length === 0 && <p style={{ fontSize: 12.5, color: "#A79F8C" }}>No sales in this range.</p>}
        {PAYMENT_METHODS.map((m) => byMethod[m] ? (
          <div key={m} className="flex justify-between" style={{ padding: "4px 0", fontSize: 13 }}><span>{m}</span><span style={{ fontFamily: MONO_FONT, fontWeight: 600 }}>{fmtKES(byMethod[m])}</span></div>
        ) : null)}
      </SectionCard>

      <p style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", margin: "14px 0 8px" }}>Transactions</p>
      {[...filteredSales].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((s) => (
        <SectionCard key={s.id}>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 600 }}>Receipt #{String(s.receiptNo).padStart(6, "0")}</p>
              <p style={{ fontSize: 11, color: SLATE, marginTop: 1 }}>{fmtDateTime(s.createdAt)} · {s.cashierName} · {s.paymentMethod}</p>
            </div>
            <div className="flex items-center gap-2">
              <p style={{ fontFamily: MONO_FONT, fontWeight: 700 }}>{fmtKES(s.total)}</p>
              <button
                onClick={() => {
                  if (window.confirm(`Delete Receipt #${String(s.receiptNo).padStart(6, "0")} (${fmtKES(s.total)})? Any stock it used will be restored. This cannot be undone.`)) {
                    deleteSale(s.id);
                  }
                }}
                className="focus-ring"
                title="Delete sale"
                style={{ padding: 5, background: "none", border: "none", color: RED, cursor: "pointer" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </SectionCard>
      ))}

      {filteredExpenses.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", margin: "14px 0 8px" }}>Expenses</p>
          {filteredExpenses.map((e) => (
            <SectionCard key={e.id}>
              <div className="flex justify-between">
                <div><p style={{ fontSize: 12.5, fontWeight: 600 }}>{e.description}</p><p style={{ fontSize: 11, color: SLATE }}>{fmtDate(e.date)}</p></div>
                <p style={{ fontFamily: MONO_FONT, fontWeight: 700, color: RED }}>{fmtKES(e.amount)}</p>
              </div>
            </SectionCard>
          ))}
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  MY SALES (cashier view)
 * ---------------------------------------------------------------------- */
function MySalesView({ sales, session, showReceipt, deleteSale }) {
  const mine = sales.filter((s) => s.cashierId === session.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const today = todayISO();
  const todayMine = mine.filter((s) => s.createdAt.slice(0, 10) === today);
  const todayTotal = todayMine.reduce((s, x) => s + x.total, 0);

  const handleDelete = (s) => {
    if (window.confirm(`Delete Receipt #${String(s.receiptNo).padStart(6, "0")} (${fmtKES(s.total)})? Any stock it used will be restored. This cannot be undone.`)) {
      deleteSale(s.id);
    }
  };

  return (
    <div className="px-4 py-4">
      <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800, marginBottom: 4 }}>My Sales</h2>
      <p style={{ fontSize: 12, color: SLATE, marginBottom: 10 }}>Today: {todayMine.length} sales · {fmtKES(todayTotal)}</p>
      {mine.length === 0 && <EmptyState text="No sales yet." />}
      {mine.map((s) => (
        <div key={s.id} className="flex items-center gap-1.5" style={{ marginBottom: 10 }}>
          <button onClick={() => showReceipt(s)} className="focus-ring" style={{ flex: 1, textAlign: "left", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, cursor: "pointer" }}>
            <div className="flex justify-between">
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 600 }}>Receipt #{String(s.receiptNo).padStart(6, "0")}</p>
                <p style={{ fontSize: 11, color: SLATE, marginTop: 1 }}>{fmtDateTime(s.createdAt)} · {s.paymentMethod}</p>
              </div>
              <p style={{ fontFamily: MONO_FONT, fontWeight: 700 }}>{fmtKES(s.total)}</p>
            </div>
          </button>
          <button onClick={() => handleDelete(s)} className="focus-ring" title="Delete sale" style={{ padding: 10, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, color: RED, cursor: "pointer" }}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  USERS
 * ---------------------------------------------------------------------- */
function UsersView({ users, update, session }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", pin: "", role: "Cashier" });

  const openNew = () => { setForm({ name: "", pin: "", role: "Cashier" }); setEditing(null); setShowForm(true); };
  const openEdit = (u) => { setForm({ name: u.name, pin: u.pin, role: u.role }); setEditing(u.id); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim() || !/^\d{4,6}$/.test(form.pin)) return;
    if (editing) {
      await update.users(users.map((u) => (u.id === editing ? { ...u, ...form } : u)));
    } else {
      await update.users([...users, { id: uid(), ...form }]);
    }
    setShowForm(false);
  };
  const remove = async (id) => {
    if (id === session.id) return;
    const admins = users.filter((u) => u.role === "Administrator");
    const target = users.find((u) => u.id === id);
    if (target.role === "Administrator" && admins.length <= 1) return;
    await update.users(users.filter((u) => u.id !== id));
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800 }}>Users ({users.length})</h2>
        <button onClick={openNew} className="focus-ring flex items-center gap-1.5" style={{ padding: "8px 13px", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><Plus size={14} /> Add</button>
      </div>
      {users.map((u) => (
        <SectionCard key={u.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFE3C8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{u.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13.5 }}>{u.name}{u.id === session.id ? " (you)" : ""}</p>
                <p className="flex items-center gap-1" style={{ fontSize: 11.5, color: SLATE }}><Lock size={10} /> PIN {u.pin} · {u.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(u)} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: SLATE, cursor: "pointer" }}><Pencil size={14} /></button>
              <button onClick={() => remove(u.id)} disabled={u.id === session.id} className="focus-ring" style={{ padding: 6, background: "none", border: "none", color: u.id === session.id ? "#D8D2BD" : RED, cursor: u.id === session.id ? "not-allowed" : "pointer" }}><Trash2 size={14} /></button>
            </div>
          </div>
        </SectionCard>
      ))}
      {showForm && (
        <Modal title={editing ? "Edit user" : "Add user"} onClose={() => setShowForm(false)}>
          <Field label="Full name"><input className="focus-ring" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="PIN (4–6 digits)"><input inputMode="numeric" className="focus-ring" style={inputStyle} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Role">
            <select className="focus-ring" style={inputStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option>Administrator</option>
              <option>Cashier</option>
            </select>
          </Field>
          <ModalActions onCancel={() => setShowForm(false)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 *  SETTINGS
 * ---------------------------------------------------------------------- */
function SettingsView({ settings, update }) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const save = async () => {
    await update.settings({ ...form, nextReceiptNo: Number(form.nextReceiptNo) });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <div className="px-4 py-4">
      <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 17, fontWeight: 800, marginBottom: 10 }}>Settings</h2>
      <SectionCard>
        <Field label="Business name"><input className="focus-ring" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Address"><input className="focus-ring" style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <Field label="Phone (optional)"><input className="focus-ring" style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Receipt footer message"><input className="focus-ring" style={inputStyle} value={form.receiptFooter} onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })} /></Field>
        <Field label="Next receipt number"><input type="number" className="focus-ring" style={inputStyle} value={form.nextReceiptNo} onChange={(e) => setForm({ ...form, nextReceiptNo: e.target.value })} /></Field>
        <button onClick={save} className="focus-ring w-full" style={{ padding: "10px 0", borderRadius: 9, border: "none", background: INK, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
          {saved ? "Saved ✓" : "Save changes"}
        </button>
      </SectionCard>
    </div>
  );
}
