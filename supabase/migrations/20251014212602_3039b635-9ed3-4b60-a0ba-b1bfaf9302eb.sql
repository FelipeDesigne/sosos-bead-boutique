-- Criar tabela de produtos (pulseiras)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ver os produtos
CREATE POLICY "Produtos são públicos para leitura"
  ON public.products
  FOR SELECT
  USING (true);

-- Política: Apenas usuários autenticados podem inserir produtos
CREATE POLICY "Apenas autenticados podem inserir produtos"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Apenas usuários autenticados podem atualizar produtos
CREATE POLICY "Apenas autenticados podem atualizar produtos"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Apenas usuários autenticados podem deletar produtos
CREATE POLICY "Apenas autenticados podem deletar produtos"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar bucket de storage para imagens das pulseiras
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage: Todos podem ver as imagens
CREATE POLICY "Imagens são públicas"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'products');

-- Políticas de storage: Apenas autenticados podem fazer upload
CREATE POLICY "Apenas autenticados podem fazer upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Políticas de storage: Apenas autenticados podem atualizar
CREATE POLICY "Apenas autenticados podem atualizar imagens"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products');

-- Políticas de storage: Apenas autenticados podem deletar
CREATE POLICY "Apenas autenticados podem deletar imagens"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');