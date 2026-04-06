"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { articlesService } from "@/services/articles.service";
import { categoriesService } from "@/services/categories.service";
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Package,
    AlertTriangle,
    Loader2,
    Image as ImageIcon,
    MoreVertical,
    Layers
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { Article } from "shared";

export default function AdminProductsPage() {
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Article> | null>(null);
    const queryClient = useQueryClient();

    const { data: paginatedProducts, isLoading } = useQuery({
        queryKey: ["admin-products", search],
        queryFn: () => articlesService.getAll({ search: search || undefined }),
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesService.getAll(),
    });

    const products = paginatedProducts?.data || [];

    const upsertMutation = useMutation({
        mutationFn: (data: any) => {
            if (data.id) return articlesService.update(data.id, data);
            return articlesService.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            setIsDialogOpen(false);
            setEditingProduct(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => articlesService.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    });

    const handleEdit = (product: Article) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct({ name: "", price: 0, stock_quantity: 0, description: "", category_id: categories?.[0]?.id });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Inventory <span className="text-orange-500">Forge</span></h1>
                    <p className="text-slate-500 font-mono text-xs mt-1">CATALOG_SYNC: ACTIVE // UNITS_DETECTED: {products.length}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search high-performance units..."
                            className="pl-10 bg-slate-900 border-slate-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button className="bg-orange-600 hover:bg-orange-700 font-black tracking-widest text-[10px]" onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" /> ADD_UNIT
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-40">
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product.id} className="bg-slate-900/50 border-slate-800 group hover:border-orange-500/50 transition-all duration-500">
                            <CardHeader className="p-0 border-b border-slate-800 relative overflow-hidden h-40 bg-black flex items-center justify-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity" />
                                ) : (
                                    <Package className="h-12 w-12 text-slate-800" />
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {product.stock_quantity < 5 && (
                                        <Badge className="bg-red-600/20 text-red-500 border border-red-500/30 text-[8px] font-black uppercase">Low Stock</Badge>
                                    )}
                                    <Badge className="bg-slate-950/80 border-slate-700 text-[8px] font-black uppercase">T-{product.id}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-sm tracking-tight line-clamp-1 h-5">{product.name}</h3>
                                    <p className="text-orange-500 font-black text-sm">${product.price}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                        <Layers className="h-3 w-3" /> CATEGORY_{product.category_id}
                                    </div>
                                    <span className={`text-[10px] font-black ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        QTY: {product.stock_quantity}
                                    </span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1 border-slate-800 bg-slate-900 text-[10px] font-black tracking-widest hover:bg-orange-600 transition-colors" onClick={() => handleEdit(product)}>
                                        <Edit3 className="h-3 w-3 mr-2" /> EDIT
                                    </Button>
                                    <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-red-500 hover:bg-red-500/10" onClick={() => deleteMutation.mutate(product.id!)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Product Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                            {editingProduct?.id ? "Modify" : "Forge New"} <span className="text-orange-500 text-decoration-none uppercase tracking-tighter">Unit</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold text-slate-500">Name</Label>
                            <Input
                                value={editingProduct?.name || ""}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                className="col-span-3 bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold text-slate-500">Category</Label>
                            <Select
                                value={editingProduct?.category_id?.toString()}
                                onValueChange={(val) => setEditingProduct({ ...editingProduct, category_id: Number(val) })}
                            >
                                <SelectTrigger className="col-span-3 bg-slate-950 border-slate-800 uppercase font-black text-[10px]">
                                    <SelectValue placeholder="Select Sector" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id!.toString()} className="uppercase text-[10px] font-bold">
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold text-slate-500">Credits ($)</Label>
                            <Input
                                type="number"
                                value={editingProduct?.price || 0}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                className="col-span-3 bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold text-slate-500">Quantity</Label>
                            <Input
                                type="number"
                                value={editingProduct?.stock_quantity || 0}
                                onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                                className="col-span-3 bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs uppercase font-bold text-slate-500">Image URL</Label>
                            <Input
                                value={editingProduct?.image_url || ""}
                                onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                className="col-span-3 bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right text-xs uppercase font-bold text-slate-500 mt-2">Description</Label>
                            <textarea
                                value={editingProduct?.description || ""}
                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                className="col-span-3 bg-slate-950 border-slate-800 rounded-md p-2 text-sm min-h-[100px] outline-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="hover:bg-slate-800" onClick={() => setIsDialogOpen(false)}>ABORT</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 font-black tracking-widest text-[10px]"
                            disabled={upsertMutation.isPending}
                            onClick={() => upsertMutation.mutate(editingProduct)}
                        >
                            {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "EXECUTE_SYNC"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
