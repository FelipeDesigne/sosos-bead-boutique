import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Plus, Edit2, Trash2, Upload, Sparkles } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro ao fazer upload da imagem",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";
      
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (!url) {
          setLoading(false);
          return;
        }
        imageUrl = url;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        ...(imageUrl && { image_url: imageUrl }),
      };

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Produto atualizado! 💕",
          description: "As alterações foram salvas.",
        });
      } else {
        if (!imageUrl) {
          toast({
            title: "Imagem obrigatória",
            description: "Por favor, adicione uma imagem do produto.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase
          .from("products")
          .insert([{ ...productData, image_url: imageUrl }]);

        if (error) throw error;

        toast({
          title: "Produto criado! ✨",
          description: "Nova pulseirinha adicionada com sucesso.",
        });
      }

      setFormData({ name: "", description: "", price: "" });
      setImageFile(null);
      setEditingId(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Produto excluído! 🗑️",
        description: "O produto foi removido.",
      });
      fetchProducts();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", price: "" });
    setImageFile(null);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen gradient-soft">
      <Header isAdmin />

      <div className="container mx-auto px-4 py-8">
        <Card className="gradient-card border-2 border-primary/20 shadow-soft mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {editingId ? "Editar Pulseirinha" : "Nova Pulseirinha"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Nome da pulseirinha"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Descrição"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Preço (R$)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary transition-smooth">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : "Clique para adicionar imagem"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="gradient-primary hover:shadow-glow transition-smooth flex-1"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar Produto"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    className="border-primary/30"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="gradient-card border-2 border-primary/20 shadow-soft">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-primary mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                <p className="text-xl font-bold text-primary mb-3">
                  R$ {product.price.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1 border-primary/30"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card className="gradient-card border-2 border-primary/20 p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            <p className="text-lg text-muted-foreground">
              Nenhuma pulseirinha cadastrada ainda. Crie a primeira! 💕
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}