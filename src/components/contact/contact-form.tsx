"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createContactMessage } from "@/lib/supabase/contact";

const ContactForm = () => {
  const locale = useLocale() as 'es' | 'en';
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({ type: null, message: "" });

    const result = await createContactMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject,
      message: formData.message,
    });

    if (result.success && result.message) {
      // Enviar correos electrónicos
      try {
        const emailResponse = await fetch('/api/email/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: result.message.id,
            locale,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Error sending emails:', await emailResponse.text());
          // No fallar si los correos fallan, solo loguear
        }
      } catch (error) {
        console.error('Error sending emails:', error);
        // No fallar si los correos fallan, solo loguear
      }

      setSubmitStatus({
        type: "success",
        message: t('successMessage'),
      });
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } else {
      setSubmitStatus({
        type: "error",
        message: result.error || t('errorMessage'),
      });
    }

    setIsLoading(false);

    // Clear status after 10 seconds
    setTimeout(() => {
      setSubmitStatus({ type: null, message: "" });
    }, 10000);
  };

  return (
    <div className="rounded-2xl bg-card p-8 lg:p-10 shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground">
          {t('sendMessageTitle')}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t('sendMessageDescription')}
        </p>
      </div>

      {submitStatus.type && (
        <Alert
          className={`mb-6 ${
            submitStatus.type === "error"
              ? "border-red-500"
              : "border-green-500"
          }`}
        >
          {submitStatus.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('name')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder={t('namePlaceholder')}
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('phonePlaceholder')}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Asunto */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            {t('subject')} <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({ ...formData, subject: value })
            }
            required
            disabled={isLoading}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder={t('subjectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anillos-compromiso">
                {t('subjectOption1')}
              </SelectItem>
              <SelectItem value="diseno-personalizado">
                {t('subjectOption2')}
              </SelectItem>
              <SelectItem value="cotizacion">{t('subjectOption3')}</SelectItem>
              <SelectItem value="reparacion">{t('subjectOption4')}</SelectItem>
              <SelectItem value="garantia">{t('subjectOption5')}</SelectItem>
              <SelectItem value="envio">{t('subjectOption6')}</SelectItem>
              <SelectItem value="otro">{t('subjectOption7')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mensaje */}
        <div className="space-y-2">
          <Label htmlFor="message">
            {t('message')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder={t('messagePlaceholder')}
            rows={6}
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Botón de envío */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white transition-all duration-300 hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              {t('send')}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t('privacyNotice')}
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
