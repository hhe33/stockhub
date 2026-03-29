"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package2, Eye, EyeOff, Loader2, ArrowRight, Sparkles, TrendingUp, Zap, Activity, Store, Mail, Lock, Shield, AlertTriangle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { authApi } from "@/lib/api-client"

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [focused, setFocused] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await authApi.register(name, email, password)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-background relative overflow-hidden" suppressHydrationWarning>
            {mounted && (
                <>
            {/* Left Side - Branding (Visible on Desktop) */}
            <div className="hidden lg:flex w-1/2 relative flex">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                
                <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 text-primary-foreground transform hover:rotate-12 transition-transform cursor-pointer">
                            <Package2 className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground uppercase">Stock<span className="text-primary">Hub</span></span>
                    </div>

                    <div className="space-y-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                            <Sparkles className="w-4 h-4" />
                            <span className="uppercase tracking-widest">Join the Network</span>
                        </div>

                        <h1 className="text-5xl xl:text-6xl font-extrabold text-foreground leading-[1.2] tracking-normal mb-6">
                            Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-secondary animate-gradient-x">Agent Account</span> and start managing.
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                            Become part of the world's most advanced inventory ecosystem. Unified control for your entire business network.
                        </p>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <p className="text-sm font-medium text-muted-foreground">Trusted by 5,000+ companies worldwide</p>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 lg:hidden" />

                <div className="w-full max-w-lg relative group">
                    <div className="absolute inset-0 glass rounded-[3rem] border border-white/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] overflow-hidden" />
                    
                    {/* Tech Corner Brackets */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none z-30" />
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none z-30" />

                    <div className="relative z-10 p-10 lg:p-16">
                        <div className="space-y-4 mb-10 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                <Shield className="w-3.5 h-3.5" />
                                Secure Registration Protocol
                            </div>
                            <div>
                                <h2 className="text-4xl font-extrabold text-foreground tracking-tight leading-none mb-2">Initialize Account</h2>
                                <p className="text-sm text-muted-foreground font-medium">Create your credentials to access the system</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Full Name</Label>
                                <div className={cn("relative rounded-2xl overflow-hidden transition-all", focused === 'name' ? "ring-2 ring-primary/20" : "")}>
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/20" />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <Input
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocused('name')}
                                        onBlur={() => setFocused(null)}
                                        className="h-14 bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-4 font-semibold text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Email Address</Label>
                                <div className={cn("relative rounded-2xl overflow-hidden transition-all", focused === 'email' ? "ring-2 ring-primary/20" : "")}>
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/20" />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="agent@stockhub.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused(null)}
                                        className="h-14 bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-4 font-semibold text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">Security Password</Label>
                                <div className={cn("relative rounded-2xl overflow-hidden transition-all", focused === 'password' ? "ring-2 ring-primary/20" : "")}>
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/20" />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused(null)}
                                        className="h-14 bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-12 font-semibold text-sm"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground/40"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 relative overflow-hidden group/submit rounded-xl bg-transparent border border-primary/30 text-primary hover:text-white transition-all duration-500 mt-4"
                                disabled={isLoading}
                            >
                                <div className="absolute inset-0 bg-primary translate-y-full group-hover/submit:translate-y-0 transition-transform duration-500 ease-out" />
                                <div className="relative z-10 flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.3em]">
                                    {isLoading ? (
                                        <div key="loading-state" className="flex items-center gap-4">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Initializing
                                        </div>
                                    ) : (
                                        <div key="idle-state" className="flex items-center gap-4">
                                            Register Agent
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <p className="text-xs text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-bold hover:underline transition-all">
                                    Login Here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
                </>
            )}
        </div>
    )
}
