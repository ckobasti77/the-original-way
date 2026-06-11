"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useMutation, useQuery } from "convex/react";

import { sendOrderStatusEmail } from "@/app/actions";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import {
  orderStatusClasses,
  orderStatuses,
  productGenders,
} from "../_lib/constants";
import type { OrderStatus } from "../_lib/types";
import {
  buttonClass,
  ConvexSetupNotice,
  EmptyState,
  fieldClass,
  FieldLabel,
  formatCurrency,
  LoadingBlock,
  Metric,
  secondaryButtonClass,
  SectionHeader,
} from "../_components/admin-ui";

type ProductRecord = {
  _id: Id<"products">;
  name: string;
  type: "clothing" | "footwear";
  gender: "men" | "women" | "kids";
  costPrice: number;
  salePrice: number;
  sizes: string[];
};

type DraftItem = {
  productId: Id<"products">;
  productName: string;
  size: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  salePriceOverride?: number;
};

type OrderRecord = {
  _id: Id<"orders">;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  city: string;
  street: string;
  houseNumber: string;
  source: "site" | "manual";
  status: OrderStatus;
  trackingNumber?: string;
  items: DraftItem[];
  totalCost: number;
  totalSale: number;
  createdAt: number;
};

const emptyCustomer = {
  firstName: "",
  lastName: "",
  email: "",
  city: "",
  street: "",
  houseNumber: "",
};

const emptyItem = {
  productId: "" as Id<"products"> | "",
  size: "",
  quantity: "1",
  salePriceOverride: "",
};

export function EvidenceClient({ convexEnabled }: { convexEnabled: boolean }) {
  if (!convexEnabled) {
    return (
      <div className="space-y-5">
        <SectionHeader
          eyebrow="Evidencija"
          title="Porudzbine"
          description="Evidencija koristi Convex za porudzbine i Next Server Actions za status email tokove."
        />
        <ConvexSetupNotice />
      </div>
    );
  }

  return <EvidenceConvex />;
}

function EvidenceConvex() {
  const orders = useQuery(api.orders.list) as OrderRecord[] | undefined;
  const products = useQuery(api.products.list) as ProductRecord[] | undefined;
  const createOrder = useMutation(api.orders.create);
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [shippingOrder, setShippingOrder] = useState<OrderRecord | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedProduct = products?.find(
    (product) => product._id === itemForm.productId,
  );

  const draftTotals = useMemo(
    () =>
      draftItems.reduce(
        (totals, item) => ({
          cost: totals.cost + item.costPrice * item.quantity,
          sale: totals.sale + item.salePrice * item.quantity,
        }),
        { cost: 0, sale: 0 },
      ),
    [draftItems],
  );

  const stats = useMemo(() => {
    const safeOrders = orders ?? [];
    return {
      totalSale: safeOrders.reduce((sum, order) => sum + order.totalSale, 0),
      totalCost: safeOrders.reduce((sum, order) => sum + order.totalCost, 0),
      newOrders: safeOrders.filter((order) => order.status === "new").length,
      sentOrders: safeOrders.filter((order) => order.status === "sent").length,
    };
  }, [orders]);

  function addDraftItem() {
    if (!selectedProduct || !itemForm.size) {
      setMessage("Izaberi proizvod i velicinu.");
      return;
    }

    const quantity = Math.max(1, Math.round(Number(itemForm.quantity)));
    const override = itemForm.salePriceOverride.trim()
      ? Number(itemForm.salePriceOverride)
      : undefined;

    if (!Number.isFinite(quantity) || (override !== undefined && !Number.isFinite(override))) {
      setMessage("Kolicina i rucna prodajna cena moraju biti brojevi.");
      return;
    }

    setDraftItems((current) => [
      ...current,
      {
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        size: itemForm.size,
        quantity,
        costPrice: selectedProduct.costPrice,
        salePrice: override ?? selectedProduct.salePrice,
        salePriceOverride: override,
      },
    ]);
    setItemForm(emptyItem);
    setMessage("");
  }

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !customer.firstName.trim() ||
      !customer.lastName.trim() ||
      !customer.city.trim() ||
      !customer.street.trim() ||
      !customer.houseNumber.trim()
    ) {
      setMessage("Ime, prezime i adresa su obavezni.");
      return;
    }

    if (draftItems.length === 0) {
      setMessage("Dodaj bar jedan artikal u porudzbinu.");
      return;
    }

    await createOrder({
      firstName: customer.firstName.trim(),
      lastName: customer.lastName.trim(),
      email: customer.email.trim() || undefined,
      city: customer.city.trim(),
      street: customer.street.trim(),
      houseNumber: customer.houseNumber.trim(),
      source: "manual",
      items: draftItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        salePriceOverride: item.salePriceOverride,
      })),
    });

    setCustomer(emptyCustomer);
    setDraftItems([]);
    setItemForm(emptyItem);
    setMessage("Porudzbina je dodata u evidenciju.");
  }

  function notifyOrder(order: OrderRecord, status: OrderStatus, tracking?: string) {
    if (status === "new") {
      return;
    }

    startTransition(async () => {
      const result = await sendOrderStatusEmail({
        stage: status,
        email: order.email,
        firstName: order.firstName,
        lastName: order.lastName,
        orderNumber: order.orderNumber,
        trackingNumber: tracking,
      });
      setStatusMessage(result.message);
    });
  }

  async function changeStatus(order: OrderRecord, status: OrderStatus) {
    setStatusMessage("");

    if (status === "sent") {
      setShippingOrder(order);
      setTrackingNumber(order.trackingNumber ?? "");
      return;
    }

    await updateOrderStatus({
      id: order._id,
      status,
      trackingNumber: undefined,
    });
    notifyOrder(order, status);
  }

  async function submitShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!shippingOrder || !trackingNumber.trim()) {
      return;
    }

    await updateOrderStatus({
      id: shippingOrder._id,
      status: "sent",
      trackingNumber: trackingNumber.trim(),
    });
    notifyOrder(shippingOrder, "sent", trackingNumber.trim());
    setShippingOrder(null);
    setTrackingNumber("");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Evidencija"
        title="Porudzbine"
        description="Kontrolna tabla je sada evidencija: sve porudzbine sa sajta i rucno unete porudzbine, sa manuelnom promenom statusa."
      />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Metric label="Prodajna vrednost" value={formatCurrency(stats.totalSale)} />
        <Metric label="Nabavna vrednost" value={formatCurrency(stats.totalCost)} />
        <Metric label="Novo" value={`${stats.newOrders} porudzbine`} />
        <Metric label="Poslato" value={`${stats.sentOrders} porudzbine`} />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[30rem_minmax(0,1fr)]">
        <form
          onSubmit={handleCreateOrder}
          className="min-w-0 rounded-lg border border-black/10 bg-white p-4"
        >
          <h2 className="text-lg font-semibold">Nova porudzbina</h2>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldLabel label="Ime">
                <input
                  value={customer.firstName}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </FieldLabel>
              <FieldLabel label="Prezime">
                <input
                  value={customer.lastName}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </FieldLabel>
            </div>

            <FieldLabel label="Email kupca">
              <input
                value={customer.email}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="kupac@email.com"
              />
            </FieldLabel>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem]">
              <FieldLabel label="Grad">
                <input
                  value={customer.city}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </FieldLabel>
              <FieldLabel label="Ulica">
                <input
                  value={customer.street}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      street: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </FieldLabel>
              <FieldLabel label="Broj">
                <input
                  value={customer.houseNumber}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      houseNumber: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </FieldLabel>
            </div>

            <div className="rounded-lg border border-black/10 bg-[#f7f8f4] p-3">
              <p className="text-sm font-bold">Artikal</p>
              <div className="mt-3 grid gap-3">
                <FieldLabel label="Proizvod">
                  <select
                    value={itemForm.productId}
                    onChange={(event) =>
                      setItemForm({
                        productId: event.target.value as Id<"products">,
                        size: "",
                        quantity: "1",
                        salePriceOverride: "",
                      })
                    }
                    className={fieldClass}
                  >
                    <option value="">Izaberi proizvod</option>
                    {products?.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </FieldLabel>

                {selectedProduct ? (
                  <div className="rounded-md border border-black/10 bg-white p-3 text-xs text-black/60">
                    Nabavna: {formatCurrency(selectedProduct.costPrice)} | Prodajna:
                    {" "}
                    {formatCurrency(selectedProduct.salePrice)} | Pol:{" "}
                    {
                      productGenders.find(
                        (gender) => gender.value === selectedProduct.gender,
                      )?.label
                    }
                  </div>
                ) : null}

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <FieldLabel label="Velicina">
                    <select
                      value={itemForm.size}
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          size: event.target.value,
                        }))
                      }
                      className={fieldClass}
                      disabled={!selectedProduct}
                    >
                      <option value="">Velicina</option>
                      {selectedProduct?.sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Kolicina">
                    <input
                      value={itemForm.quantity}
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          quantity: event.target.value,
                        }))
                      }
                      className={fieldClass}
                      inputMode="numeric"
                    />
                  </FieldLabel>
                  <div className="col-span-2 sm:col-span-1">
                    <FieldLabel label="Rucna cena">
                      <input
                        value={itemForm.salePriceOverride}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            salePriceOverride: event.target.value,
                          }))
                        }
                        className={fieldClass}
                        inputMode="decimal"
                        placeholder="opciono"
                      />
                    </FieldLabel>
                  </div>
                </div>

                <button type="button" onClick={addDraftItem} className={secondaryButtonClass}>
                  Dodaj artikal
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-3">
              <p className="text-sm font-bold">Stavke porudzbine</p>
              {draftItems.length === 0 ? (
                <p className="mt-2 text-sm text-black/50">Nema stavki.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {draftItems.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-md bg-[#f7f8f4] px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="font-bold">{item.productName}</span>{" "}
                        {item.size} x {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftItems((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        className="text-xs font-bold text-[#9d3026]"
                      >
                        Ukloni
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  Nabavna ukupno:{" "}
                  <strong>{formatCurrency(draftTotals.cost)}</strong>
                </p>
                <p>
                  Prodajna ukupno:{" "}
                  <strong>{formatCurrency(draftTotals.sale)}</strong>
                </p>
              </div>
            </div>

            {message ? <p className="text-sm font-bold text-[#276c56]">{message}</p> : null}

            <button className={buttonClass}>Sacuvaj porudzbinu</button>
          </div>
        </form>

        <div className="min-w-0 space-y-3">
          {statusMessage ? (
            <div className="rounded-lg border border-[#276c56]/20 bg-[#edf5ef] p-3 text-sm font-bold text-[#1f5946]">
              {isPending ? "Slanje emaila..." : statusMessage}
            </div>
          ) : null}

          {orders === undefined ? <LoadingBlock /> : null}
          {orders?.length === 0 ? (
            <EmptyState text="Jos nema porudzbina u Convex bazi." />
          ) : null}

          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-black/10 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-[1080px] w-full text-left text-sm">
                    <thead className="bg-[#f4f5f1] text-xs uppercase tracking-[0.12em] text-black/50">
                      <tr>
                        <th className="px-4 py-3">Porudzbina</th>
                        <th className="px-4 py-3">Kupac</th>
                        <th className="px-4 py-3">Adresa</th>
                        <th className="px-4 py-3">Artikli</th>
                        <th className="px-4 py-3">Nabavna</th>
                        <th className="px-4 py-3">Prodajna</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-t border-black/[0.08]">
                          <td className="px-4 py-4">
                            <p className="font-mono text-xs">{order.orderNumber}</p>
                            <p className="text-xs text-black/50">
                              {new Date(order.createdAt).toLocaleDateString("sr-RS")}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold">
                              {order.firstName} {order.lastName}
                            </p>
                            <p className="text-xs text-black/50">
                              {order.email || "Nema email"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            {order.city}, {order.street} {order.houseNumber}
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <p key={`${item.productId}-${index}`}>
                                  {item.productName}, {item.size} x {item.quantity}
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold">
                            {formatCurrency(order.totalCost)}
                          </td>
                          <td className="px-4 py-4 font-semibold">
                            {formatCurrency(order.totalSale)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="grid gap-2">
                              <span
                                className={`inline-flex w-fit rounded-md border px-2 py-1 text-xs font-bold ${orderStatusClasses[order.status]}`}
                              >
                                {
                                  orderStatuses.find(
                                    (status) => status.value === order.status,
                                  )?.label
                                }
                              </span>
                              <select
                                value={order.status}
                                onChange={(event) =>
                                  void changeStatus(
                                    order,
                                    event.target.value as OrderStatus,
                                  )
                                }
                                className={fieldClass}
                              >
                                {orderStatuses.map((status) => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                              {order.trackingNumber ? (
                                <p className="text-xs text-black/55">
                                  Broj: {order.trackingNumber}
                                </p>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards List View */}
              <div className="grid gap-4 md:hidden">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-lg border border-black/10 bg-white p-4 shadow-xs flex flex-col gap-3"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
                      <span className="font-mono text-sm font-bold text-[#276c56]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-black/50">
                        {new Date(order.createdAt).toLocaleDateString("sr-RS")}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="text-sm">
                      <p className="font-bold text-[#141816]">
                        {order.firstName} {order.lastName}
                      </p>
                      {order.email && (
                        <p className="text-xs text-black/60 mt-0.5">
                          {order.email}
                        </p>
                      )}
                      <p className="text-xs text-black/70 mt-1">
                        Grad: <span className="font-semibold">{order.city}</span>, {order.street} {order.houseNumber}
                      </p>
                    </div>

                    {/* Ordered Items */}
                    <div className="bg-[#f7f8f4] rounded-md p-3 text-xs space-y-1.5 border border-black/[0.04]">
                      <p className="font-bold text-black/50 uppercase tracking-wider text-[9px]">Artikli</p>
                      {order.items.map((item, index) => (
                        <div key={`${item.productId}-${index}`} className="flex justify-between gap-2">
                          <span className="font-medium text-[#141816]">{item.productName}</span>
                          <span className="shrink-0 text-black/60 font-semibold">
                            Vel: {item.size} × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-black/[0.06] py-2">
                      <div>
                        <p className="text-black/45 uppercase text-[9px] font-bold tracking-wider">Nabavna vrednost</p>
                        <p className="font-bold mt-0.5">{formatCurrency(order.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-black/45 uppercase text-[9px] font-bold tracking-wider">Prodajna vrednost</p>
                        <p className="font-bold text-[#276c56] mt-0.5">{formatCurrency(order.totalSale)}</p>
                      </div>
                    </div>

                    {/* Status & Change Action */}
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-black/50">Status:</span>
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${orderStatusClasses[order.status]}`}
                        >
                          {
                            orderStatuses.find(
                              (status) => status.value === order.status,
                            )?.label
                          }
                        </span>
                      </div>

                      <div className="grid gap-1">
                        <select
                          value={order.status}
                          onChange={(event) =>
                            void changeStatus(
                              order,
                              event.target.value as OrderStatus,
                            )
                          }
                          className={fieldClass}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {order.trackingNumber ? (
                        <p className="text-xs text-black/55 bg-[#eef0eb] px-2 py-1 rounded-md font-mono mt-1 text-center">
                          Broj posiljke: {order.trackingNumber}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {shippingOrder ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form
            onSubmit={submitShipping}
            className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-2xl"
          >
            <h2 className="text-xl font-semibold">Poslata porudzbina</h2>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Unesi broj porudzbine/posiljke za {shippingOrder.orderNumber}.
              Nakon cuvanja kupcu se salje email kroz Server Action.
            </p>
            <div className="mt-4">
              <FieldLabel label="Broj porudzbine">
                <input
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  className={fieldClass}
                  autoFocus
                />
              </FieldLabel>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShippingOrder(null)}
                className={secondaryButtonClass}
              >
                Otkazi
              </button>
              <button className={buttonClass}>Sacuvaj i posalji email</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
