
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from '@/hooks/useWallet';
import { toast } from '@/lib/toast';
import { Shield, Bell, Eye, Monitor, Moon, Sun } from 'lucide-react';
import { formatAddress } from '@/lib/utils';

export default function Settings() {
  const { isConnected, address, disconnect } = useWallet();
  
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto max-w-7xl py-10">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
          </CardHeader>
          <CardContent>
            Please connect your wallet to access settings.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Connected Wallet</Label>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pharos-500 flex items-center justify-center">
                      <span className="font-bold text-white text-sm">P</span>
                    </div>
                    <span className="font-medium">{formatAddress(address)}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell size={18} />
                    <Label htmlFor="notifications">Notifications</Label>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye size={18} />
                    <Label htmlFor="watch-address">Watch mode</Label>
                  </div>
                  <Switch id="watch-address" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield size={18} />
                    <Label htmlFor="safety-checks">Extra safety checks</Label>
                  </div>
                  <Switch id="safety-checks" defaultChecked />
                </div>
              </div>

              <Separator />
              
              <div className="pt-2">
                <Button onClick={handleSave}>Save Account Settings</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
              <CardDescription>Configure application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                    <Sun size={18} className="mb-2" />
                    <span>Light</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                    <Moon size={18} className="mb-2" />
                    <span>Dark</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                    <Monitor size={18} className="mb-2" />
                    <span>System</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Display Currency</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="flex items-center justify-center">USD</Button>
                  <Button variant="outline" className="flex items-center justify-center">EUR</Button>
                  <Button variant="outline" className="flex items-center justify-center">PHAR</Button>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics">Analytics</Label>
                  <Switch id="analytics" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="tx-updates">Transaction updates</Label>
                  <Switch id="tx-updates" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="news">Protocol news</Label>
                  <Switch id="news" />
                </div>
              </div>

              <Separator />
              
              <div className="pt-2">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documentation and Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 space-y-2">
                <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="font-medium">Documentation</h3>
                <p className="text-xs text-center text-muted-foreground">
                  Read guides and protocol documentation
                </p>
              </Button>
              
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 space-y-2">
                <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <h3 className="font-medium">FAQs</h3>
                <p className="text-xs text-center text-muted-foreground">
                  Find answers to common questions
                </p>
              </Button>
              
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-6 space-y-2">
                <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <h3 className="font-medium">Support</h3>
                <p className="text-xs text-center text-muted-foreground">
                  Get help from our support team
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
