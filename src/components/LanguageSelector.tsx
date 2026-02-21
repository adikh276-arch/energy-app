import { useTranslation } from '@/contexts/TranslationContext';
import { LANGUAGES } from '@/lib/translate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { lang, setLang } = useTranslation();

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as any)}>
      <SelectTrigger className="w-auto gap-1.5 bg-secondary border-border h-8 text-xs">
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
