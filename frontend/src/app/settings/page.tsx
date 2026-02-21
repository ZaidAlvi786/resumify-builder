"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  Save, 
  Upload, 
  Loader2,
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/Sidebar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login?redirect=/settings")
        return
      }
      setSession(session)
      setEmail(session.user.email || "")

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setAvatarUrl(data.avatar_url || "")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      
      // Update profile immediately
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id)

      if (updateError) throw updateError
      
      alert("Profile picture updated!")
    } catch (error: any) {
      alert("Error uploading avatar: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq("id", session.user.id)

      if (error) throw error
      alert("Profile updated successfully!")
      fetchProfile()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword) return
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      alert("Password updated successfully!")
      setNewPassword("")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("/api/resume", "")
      const response = await fetch(`${BASE_URL}/api/payment/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.id,
          return_url: window.location.href,
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.detail || "Failed to open subscription manager. Do you have an active plan?")
      }
    } catch (error) {
      console.error("Error opening portal:", error)
      alert("Something went wrong.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500">Manage your account, billing, and profile settings.</p>
            </header>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
                <TabsTrigger value="profile" className="rounded-lg px-6 py-2">Profile</TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg px-6 py-2">Security</TabsTrigger>
                <TabsTrigger value="billing" className="rounded-lg px-6 py-2">Billing & Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                    <CardDescription>Update your personal details and profile picture.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b">
                      <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
                          {fullName?.charAt(0) || email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-4 flex-1 w-full text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          <Input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={saving}
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            disabled={saving}
                          >
                             {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                             Change Photo
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setAvatarUrl("")}>
                            Remove
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            id="fullName" 
                            className="pl-10" 
                            placeholder="John Doe" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            id="email" 
                            className="pl-10 bg-slate-50" 
                            value={email} 
                            disabled 
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Email change is managed via security tab.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 border-t flex justify-end p-4">
                    <Button onClick={handleUpdateProfile} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="border shadow-sm rounded-2xl bg-white">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-xl">Security & Authentication</CardTitle>
                    <CardDescription>Manage your password and account security settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Your account is secured</p>
                            <p className="text-xs text-blue-700">Multi-factor authentication is recommended for high-priority accounts.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input 
                            id="newPassword" 
                            type="password" 
                            className="pl-10" 
                            placeholder="At least 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 border-t flex justify-end p-4">
                    <Button onClick={handleUpdatePassword} disabled={saving || !newPassword} className="gap-2">
                      Update Password
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border shadow-sm rounded-2xl bg-white md:col-span-2">
                    <CardHeader className="bg-slate-50/50 border-b">
                      <CardTitle className="text-xl flex items-center justify-between">
                        Subscription Details
                        <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'} className="rounded-full">
                          {profile?.plan?.toUpperCase() || 'FREE'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>Manage your plan, billing history and credit card info.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{profile?.plan === 'pro' ? 'Pro Plan Monthly' : 'Free Forever'}</p>
                                    <p className="text-xs text-slate-500">{profile?.plan === 'pro' ? 'Next billing date: Coming soon' : 'Limited AI features'}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleManageSubscription} className="gap-2">
                                Manage <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 font-medium">AI Credits Remaining</span>
                                <span className="font-bold text-slate-900">{profile?.credits || 0} / {profile?.plan === 'pro' ? '1000' : '5'}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, ((profile?.credits || 0) / (profile?.plan === 'pro' ? 1000 : 5)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400">Credits refresh every billing cycle.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 border-t p-4 flex justify-between">
                        <p className="text-sm text-slate-500">Need more power? See our <Link href="/pricing" className="text-indigo-600 font-bold hover:underline">Pricing</Link></p>
                        <Button variant="default" onClick={() => router.push('/pricing')}>Upgrade Plan</Button>
                    </CardFooter>
                  </Card>

                  <Card className="border shadow-sm rounded-2xl bg-indigo-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircle className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white">Pro Perks</CardTitle>
                        <CardDescription className="text-indigo-100">Why upgrade to Pro?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-indigo-300" />
                                1,000 AI Credits/Mo
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-indigo-300" />
                                ATS Optimization
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-indigo-300" />
                                Priority Templates
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-indigo-300" />
                                Career Path AI
                            </li>
                        </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
