"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, MapPin, Mail, Phone, Save, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getUserProfile,
  getDefaultAddress,
  updateUserProfile,
  createAddress,
  updateAddress,
  updateUserPassword,
} from "@/lib/supabase/profiles";
import type { UserProfile, UserAddress } from "@/types/profile";

const ProfilePage = () => {
  const t = useTranslations('profile');
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data from database
  const [, setUserProfile] = useState<UserProfile | null>(null);
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);

  // Formulario de información personal
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Formulario de dirección
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "México",
  });

  // Formulario de cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data from database
  const loadUserData = useCallback(async () => {
    setIsLoadingData(true);
    const [profile, defaultAddress] = await Promise.all([
      getUserProfile(),
      getDefaultAddress(),
    ]);

    setUserProfile(profile);
    setUserAddress(defaultAddress);

    // Populate forms with data
    if (profile) {
      setPersonalInfo({
        name: profile.full_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
      });
    } else if (user) {
      setPersonalInfo({
        name: user.name || "",
        email: user.email,
        phone: "",
      });
    }

    if (defaultAddress) {
      setAddress({
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zip_code,
        country: defaultAddress.country,
      });
    }

    setIsLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      loadUserData();
    }
  }, [isAuthenticated, router, loadUserData]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateUserProfile({
      full_name: personalInfo.name,
      phone: personalInfo.phone || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      setUserProfile(result.profile || null);
      showMessage("success", t('personalInfoUpdated'));
    } else {
      showMessage("error", result.error || t('errorUpdatingInfo'));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const addressData = {
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode,
      country: address.country,
      is_default: true,
      address_type: "shipping" as const,
    };

    let result;
    if (userAddress) {
      // Update existing address
      result = await updateAddress(userAddress.id, addressData);
    } else {
      // Create new address
      result = await createAddress(addressData);
    }

    setIsLoading(false);

    if (result.success) {
      setUserAddress(result.address || null);
      showMessage("success", t('addressSaved'));
    } else {
      showMessage("error", result.error || t('errorSavingAddress'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", t('passwordsDontMatch'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", t('passwordMinLength'));
      return;
    }

    setIsLoading(true);

    const result = await updateUserPassword(passwordForm.newPassword);

    setIsLoading(false);

    if (result.success) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage("success", t('passwordUpdated'));
    } else {
      showMessage("error", result.error || t('errorUpdatingPassword'));
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background py-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pt-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === "error" ? "border-red-500" : "border-green-500"}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">{t('personalInfo')}</TabsTrigger>
            <TabsTrigger value="address">{t('shippingAddress')}</TabsTrigger>
            <TabsTrigger value="password">{t('changePassword')}</TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('personalInfo')}
                </CardTitle>
                <CardDescription>
                  {t('updateContactInfo')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('fullName')}</Label>
                    <Input
                      id="name"
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('emailCannotBeChanged')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t('phone')}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+52 33 1234 5678"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, phone: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941E]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('saveChanges')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dirección de Envío */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('shippingAddress')}
                </CardTitle>
                <CardDescription>
                  {t('saveAddressForFasterShipping')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">{t('streetAndNumber')}</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder={t('streetPlaceholder')}
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('city')}</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder={t('cityPlaceholder')}
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">{t('state')}</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder={t('statePlaceholder')}
                        value={address.state}
                        onChange={(e) =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">{t('zipCode')}</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="44100"
                        value={address.zipCode}
                        onChange={(e) =>
                          setAddress({ ...address, zipCode: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">{t('country')}</Label>
                      <Input
                        id="country"
                        type="text"
                        value={address.country}
                        onChange={(e) =>
                          setAddress({ ...address, country: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941E]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('saveAddress')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cambiar Contraseña */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t('changePassword')}
                </CardTitle>
                <CardDescription>
                  {t('updatePasswordSecurely')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('currentPasswordHelp')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('passwordMinChars')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t('confirmNewPassword')}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941E]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('updating')}
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        {t('changePasswordButton')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
