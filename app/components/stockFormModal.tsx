import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateForInput } from "@/lib/HelperFunctions";
import { StockProductType, Transaction } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function StockFormModal({
  transaction,
  products,
  onClose,
  onSubmit,
}: {
  transaction: Transaction | null;
  products: StockProductType[];
  onClose: () => void;
  onSubmit: (formData: any) => void;
}) {
  const [formData, setFormData] = useState<Transaction>({
    id: transaction?.id || "",
    stock_type: transaction?.stock_type || "",
    trans_date: transaction?.trans_date
      ? formatDateForInput(transaction.trans_date)
      : formatDateForInput(new Date().toISOString()),
    factory_id: transaction?.factory_id || "",
    product_id: transaction?.product_id || "",
    transaction_desc: transaction?.transaction_desc || "",
    trans_mode: transaction?.trans_mode || "",
    qty: transaction?.qty || 0,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  //dynamically select the product list based on the stock transaction type: Unprocessed or Processed
  const currentProducts = products.filter((p) =>
    formData.stock_type === "UNPROCESSED"
      ? p.productnature_id === 1
      : p.productnature_id === 2,
  );

  //handling form submission.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(formData);
  }
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="trans_date">Transaction Date</Label>
            <Input
              id="trans_date"
              type="date"
              value={formData.trans_date}
              onChange={(e) => handleInputChange("trans_date", e.target.value)}
              required
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_type">Stock Type</Label>
            <Select
              value={formData.stock_type}
              onValueChange={(value) => handleInputChange("stock_type", value)}
              required
            >
              <SelectTrigger className="border-slate-200 w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNPROCESSED">Unprocessed</SelectItem>
                <SelectItem value="PROCESSED">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trans_mode">Transaction Mode</Label>
            <Select
              value={formData.trans_mode}
              onValueChange={(value) => handleInputChange("trans_mode", value)}
              required
            >
              <SelectTrigger className="border-slate-200 w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => handleInputChange("product_id", value)}
              required
            >
              <SelectTrigger className="border-slate-200 w-full">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {currentProducts.map((grade) => (
                  <SelectItem key={grade.id} value={String(grade.id)}>
                    {grade.crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">Quantity (tons)</Label>
            <Input
              id="qty"
              type="number"
              step="0.01"
              value={formData.qty}
              onChange={(e) =>
                handleInputChange("qty", parseFloat(e.target.value))
              }
              required
              className="border-slate-200"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="trans_description">Description</Label>
            <Textarea
              id="trans_description"
              value={formData.transaction_desc}
              onChange={(e) =>
                handleInputChange("transaction_desc", e.target.value)
              }
              className="border-slate-200"
              placeholder="Optional transaction description..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Save className="w-4 h-4 mr-2" />
            save
          </Button>
        </div>
      </form>
    </div>
  );
}
