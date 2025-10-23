"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  upsertUserProfile,
  createAddress,
  updateAddress,
  updateUserPassword,
} from "@/lib/supabase/profiles";
import type { UserProfile, UserAddress } from "@/types/profile";

const ProfilePage = () => {
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

    const result = await upsertUserProfile({
      full_name: personalInfo.name,
      phone: personalInfo.phone || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      setUserProfile(result.profile || null);
      showMessage("success", "Información personal actualizada correctamente");
    } else {
      showMessage("error", result.error || "Error al actualizar la información");
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
      showMessage("success", "Dirección guardada correctamente");
    } else {
      showMessage("error", result.error || "Error al guardar la dirección");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "Las contraseñas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "La contraseña debe tener al menos 6 caracteres");
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
      showMessage("success", "Contraseña actualizada correctamente");
    } else {
      showMessage("error", result.error || "Error al actualizar la contraseña");
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Mi Perfil</h1>
          <p className="mt-2 text-muted-foreground">
            Administra tu información personal y preferencias
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
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="address">Dirección de Envío</TabsTrigger>
            <TabsTrigger value="password">Contraseña</TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePersonalInfo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
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
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      El correo electrónico no se puede modificar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
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
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
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
                  Dirección de Envío
                </CardTitle>
                <CardDescription>
                  Guarda tu dirección para envíos más rápidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Calle y número</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="Av. Juárez #123"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Guadalajara"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="Jalisco"
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
                      <Label htmlFor="zipCode">Código Postal</Label>
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
                      <Label htmlFor="country">País</Label>
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
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Dirección
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
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Actualiza tu contraseña de forma segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
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
                      Por seguridad, ingresa tu contraseña actual
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
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
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar nueva contraseña
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
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Cambiar Contraseña
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
