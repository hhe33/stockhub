"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package2, Eye, EyeOff, Loader2, ArrowRight, Sparkles, TrendingUp, Zap, Activity, Store, Mail, Lock, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { authApi } from "@/lib/api-client"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [focused, setFocused] = useState<string | null>(null)
    const [step, setStep] = useState(1)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Load remembered email if exists
        if (typeof window !== "undefined") {
            const rememberedEmail = localStorage.getItem("remembered_email")
            if (rememberedEmail) {
                setEmail(rememberedEmail)
            }
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await authApi.login(email, password)
            // Save email if remember me is checked
            const rememberMe = (document.getElementById("remember") as HTMLInputElement)?.checked
            if (rememberMe) {
                localStorage.setItem("remembered_email", email)
            } else {
                localStorage.removeItem("remembered_email")
            }
            // Full reload to ensure a fresh state after login
            window.location.href = "/dashboard"
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-background relative overflow-hidden" suppressHydrationWarning>
            {mounted && (
                <>
            {/* Left Side - Branding */}
            <div className={cn(
                "w-full lg:w-1/2 relative flex",
                step === 1 ? "" : "hidden lg:flex"
            )}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

                {/* Floating Decorative Cards (Desktop only) */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden">
                    <div className={cn(
                        "absolute top-[15%] right-[5%] glass p-4 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 transform",
                        mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    )} style={{ transitionDelay: '200ms' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Stock Efficiency</p>
                                <p className="text-sm font-bold text-foreground">+24.5% Improvement</p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "absolute bottom-[15%] left-[15%] glass p-4 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 transform",
                        mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    )} style={{ transitionDelay: '400ms' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 relative">
                                <Zap className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Live Alert</p>
                                <p className="text-sm font-bold text-foreground">Low Stock: Laptop Stand</p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "absolute bottom-[45%] right-[5%] glass p-3 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 transform",
                        mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    )} style={{ transitionDelay: '600ms' }}>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">Real-time sync</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 w-full h-full">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 text-primary-foreground transform hover:rotate-12 transition-transform cursor-pointer">
                            <Package2 className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground uppercase">Stock<span className="text-primary">Hub</span></span>
                    </div>

                    <div className="space-y-6 lg:space-y-10 max-w-2xl mt-12 lg:mt-0">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary animate-bounce-slow">
                            <Sparkles className="w-4 h-4" />
                            <span className="uppercase tracking-widest">Master Your Inventory</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground leading-[1.3] lg:leading-[1.2] tracking-normal mb-6">
                            Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-secondary animate-gradient-x">Every Store</span> with <span className="underline decoration-primary/30 decoration-4 lg:decoration-8 underline-offset-[12px]">Total Precision</span>.
                        </h1>

                        <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-medium">
                            The all-in-one platform for retail networks. Manage stock, track sales, and optimize transfers across your entire organization.
                        </p>

                        <div className="grid grid-cols-3 gap-3 lg:gap-6 xl:gap-8 pt-4 lg:pt-8">
                            {[
                                { value: "500+", label: "Active Stores", icon: Store },
                                { value: "1M+", label: "Items Synced", icon: Package2 },
                                { value: "99.9%", label: "System Uptime", icon: Zap },
                            ].map((stat, i) => (
                                <div key={stat.label} className="group relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
                                    <div className="glass relative rounded-2xl p-4 lg:p-6 border border-white/10 text-center hover:border-primary/50 transition-all duration-300 group-hover:scale-[1.02]">
                                        <div className="text-2xl lg:text-3xl xl:text-4xl font-black text-foreground mb-1 tabular-nums">{stat.value}</div>
                                        <div className="text-[10px] lg:text-xs text-muted-foreground uppercase font-bold tracking-widest leading-none">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Step 1 Button */}
                        <div className="pt-8 lg:hidden">
                            <Button
                                onClick={() => setStep(2)}
                                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold shadow-2xl shadow-primary/40 group active:scale-95 transition-all"
                            >
                                Get Started
                                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                            </Button>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-between mt-12 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-full bg-muted border-4 border-background flex items-center justify-center text-sm font-bold text-muted-foreground shadow-lg"
                                    >
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">StockHub Ecosystem</p>
                                <p className="text-xs text-muted-foreground">Trusted by <span className="text-primary font-bold">5,000+</span> companies</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Radical Holographic Login Form */}
            <div className={cn(
                "w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative transition-all duration-700 ease-in-out bg-transparent",
                step === 2 ? "flex" : "hidden lg:flex"
            )}>
                {/* Background for form section on mobile */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 lg:hidden" />

                {/* The "Console" Container */}
                <div className="w-full max-w-lg relative group">
                    {/* Simplified Background */}
                    <div className="absolute inset-0 glass rounded-[3rem] border border-white/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] overflow-hidden" />

                    {/* Tech Corner Brackets */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none z-30" />
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none z-30" />

                    {/* System Metadata Text */}
                    <div className="absolute top-4 right-8 flex gap-4 text-[8px] font-mono text-primary/40 uppercase tracking-[0.2em] pointer-events-none">
                        <span>[SYST: ACTIVE]</span>
                        <span>[AUTH: REQ]</span>
                        <span>STK-H v1.0</span>
                    </div>

                    <div className="relative z-10 p-10 lg:p-16">
                        {/* Mobile Back Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(1)}
                            className="lg:hidden mb-8 text-muted-foreground hover:text-foreground p-0 h-auto group/back transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover/back:border-primary/50 transition-colors">
                                    <ArrowRight className="h-4 w-4 rotate-180" />
                                </div>
                                <span className="font-bold text-xs uppercase tracking-widest">Return to Command</span>
                            </div>
                        </Button>

                        <div className="space-y-4 mb-12 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                <Shield className="w-3.5 h-3.5" />
                                Secure Access Protocol
                            </div>
                            <div>
                                <h2 className="text-4xl font-extrabold text-foreground tracking-tight leading-none mb-2">Welcome Back</h2>
                                <p className="text-sm text-muted-foreground font-medium">Please verify your agent credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div key="error-message" className="p-4 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2 group/input">
                                <Label htmlFor="email" className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-1">
                                    Email Address
                                </Label>
                                <div className={cn(
                                    "relative group/field transition-all duration-300 rounded-2xl overflow-hidden",
                                    focused === 'email' ? "ring-2 ring-primary/20" : ""
                                )}>
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/20 group-hover/field:bg-primary/50 transition-colors" />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within/field:text-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@stockhub.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused(null)}
                                        className="h-14 bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-4 placeholder:text-muted-foreground/20 focus-visible:ring-0 focus-visible:border-primary/40 transition-all font-semibold text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group/input">
                                <div className="flex justify-between items-center ml-1">
                                    <Label htmlFor="password" className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                                        Security Password
                                    </Label>
                                    <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-tighter">
                                        Lost Access?
                                    </Button>
                                </div>
                                <div className={cn(
                                    "relative group/field transition-all duration-300 rounded-2xl overflow-hidden",
                                    focused === 'password' ? "ring-2 ring-primary/20" : ""
                                )}>
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/20 group-hover/field:bg-primary/50 transition-colors" />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within/field:text-primary">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused(null)}
                                        className="h-14 bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-12 placeholder:text-muted-foreground/20 focus-visible:ring-0 focus-visible:border-primary/40 transition-all font-semibold text-sm"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground/40 hover:text-primary hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" className="border-white/20 bg-white/5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                                    <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                                        Remember agent credentials
                                    </Label>
                                </div>
                            </div>


                            <Button
                                type="submit"
                                className="w-full h-16 relative overflow-hidden group/submit rounded-xl bg-transparent border border-primary/30 text-primary hover:text-white transition-all duration-500"
                                disabled={isLoading}
                            >
                                {/* Fill background animation */}
                                <div className="absolute inset-0 bg-primary translate-y-full group-hover/submit:translate-y-0 transition-transform duration-500 ease-out" />

                                <div className="relative z-10 flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.3em]">
                                    {isLoading ? (
                                        <div key="loading-state" className="flex items-center gap-4">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Authenticating
                                        </div>
                                    ) : (
                                        <div key="idle-state" className="flex items-center gap-4">
                                            Execute Login
                                            <div className="w-6 h-[1px] bg-current opacity-50 group-hover/submit:w-10 transition-all" />
                                        </div>
                                    )}
                                </div>

                                {/* Decorative corner dots on button */}
                                <div className="absolute top-1 left-1 w-1 h-1 bg-current opacity-50" />
                                <div className="absolute bottom-1 right-1 w-1 h-1 bg-current opacity-50" />
                            </Button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-6 text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em] font-bold">
                                {["SOC 2", "GDPR", "ISO 27001"].map((badge) => (
                                    <div key={badge} className="flex items-center gap-2 group cursor-crosshair">
                                        <div className="w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary" />
                                        <span className="group-hover:text-primary/60 transition-colors">{badge}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-muted-foreground/30 font-mono">
                                New agent? <Link href="/register" className="text-primary/40 hover:text-primary transition-colors">Request Clearance (Register)</Link>
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

