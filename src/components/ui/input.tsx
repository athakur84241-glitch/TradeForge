"use client";
import * as React from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { cn } from "@/lib/utils";
export const inputClass = "h-11 w-full rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-white/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn(inputClass, className)} {...props} />);
Input.displayName = "Input";
export function Field({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-medium text-foreground">{label}<>{children}</>{error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}</label>; }
export function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) { const [shown, setShown] = React.useState(false); return <div className="relative"><Input type={shown ? "text" : "password"} className="pr-11" {...props} /><button type="button" onClick={() => setShown(!shown)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground" aria-label={shown ? "Hide password" : "Show password"}>{shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>; }
export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" className="pl-10" {...props} /></div>; }
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn(inputClass, "h-auto min-h-28 py-3", className)} {...props} />);
Textarea.displayName = "Textarea";
