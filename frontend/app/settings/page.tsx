"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { User, Bell, Shield, Building, Save, Mail, Phone, Globe, Lock, Key, Smartphone, AlertCircle, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api-client"

function SettingsContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'profile'
  const [mounted, setMounted] = useState(false)

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@stockhub.com",
    phone: "+1 555-0100",
  })

  useEffect(() => {
    setMounted(true)
    const user = authApi.getUser()
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }))
    }
  }, [])

  const userInitials = profile.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AU'

  const [company, setCompany] = useState({
    name: "StockHub Inc.",
    address: "123 Business Ave, New York, NY 10001",
    currency: "USD",
    timezone: "America/New_York",
  })

  const [notifications, setNotifications] = useState({
    lowStock: true,
    newSales: true,
    transferUpdates: true,
    emailDigest: false,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 lg:p-8">
      <Tabs defaultValue={defaultTab} className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <TabsList className="bg-muted/50 p-1 h-auto rounded-xl">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={handleSave}
            className={cn(
              "rounded-xl shadow-lg transition-all",
              saved ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25" : "shadow-primary/20"
            )}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and contact information.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-xl shadow-primary/25">
                    {mounted ? userInitials : '..'}
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Change Photo
                  </Button>
                </div>

                {/* Form Fields */}
                <FieldGroup className="flex-1 gap-5">
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Full Name
                    </FieldLabel>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email Address
                    </FieldLabel>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                    </FieldLabel>
                    <Input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                </FieldGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary/20">
                  <Building className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle>Company Settings</CardTitle>
                  <CardDescription>Configure your company details and preferences.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup className="max-w-xl gap-5">
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Company Name
                  </FieldLabel>
                  <Input
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Address
                  </FieldLabel>
                  <Input
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Currency</FieldLabel>
                    <Input
                      value={company.currency}
                      onChange={(e) => setCompany({ ...company, currency: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Timezone</FieldLabel>
                    <Input
                      value={company.timezone}
                      onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Bell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-w-xl">
                {[
                  { key: "lowStock", icon: AlertCircle, title: "Low Stock Alerts", description: "Get notified when products are running low", color: "text-rose-500" },
                  { key: "newSales", icon: Check, title: "New Sales", description: "Receive alerts for new transactions", color: "text-emerald-500" },
                  { key: "transferUpdates", icon: Building, title: "Transfer Updates", description: "Get updates on stock transfer status", color: "text-blue-500" },
                  { key: "emailDigest", icon: Mail, title: "Daily Email Digest", description: "Receive a daily summary via email", color: "text-primary" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg bg-muted/50", item.color)}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10">
                  <Lock className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>Manage your password and security preferences.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup className="max-w-xl gap-5">
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    Current Password
                  </FieldLabel>
                  <Input type="password" placeholder="Enter current password" className="h-11 rounded-xl" />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    New Password
                  </FieldLabel>
                  <Input type="password" placeholder="Enter new password" className="h-11 rounded-xl" />
                </Field>
                <Field>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <Input type="password" placeholder="Confirm new password" className="h-11 rounded-xl" />
                </Field>
                <Button className="w-fit rounded-xl">
                  <Shield className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 max-w-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-muted">
                    <Key className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Enable 2FA</p>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Secure your account with authenticator app</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <TopNavbar title="Settings" subtitle="Manage your account and preferences" />
      <Suspense fallback={<div className="p-8">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </DashboardLayout>
  )
}
