"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface DepositModalProps {
  asset: {
    id: string
    name: string
    symbol: string
    icon: React.ElementType
    balance: number
    value: number
    apy: number
    restakingApy: number
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: (amount: number, symbol: string) => void
}

export function DepositModal({ asset, isOpen, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const [isCollateralEnabled, setIsCollateralEnabled] = useState(true)
  const [isRewardsOpen, setIsRewardsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate new credit score based on deposit amount
  const currentScore = 720
  const depositValue = (Number.parseFloat(amount) * asset.value) / asset.balance || 0
  const scoreIncrease = Math.min(Math.floor(depositValue / 100), 30)
  const newScore = currentScore + scoreIncrease

  const scorePercentage = (newScore / 850) * 100

  const handleMaxClick = () => {
    setAmount(asset.balance.toString())
  }

  const handleDeposit = () => {
    if (!amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > asset.balance) {
      return
    }

    setIsProcessing(true)

    // Simulate transaction processing
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess(Number.parseFloat(amount), asset.symbol)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <asset.icon className="h-6 w-6 text-primary" />
            Deposit {asset.name}
          </DialogTitle>
          <DialogDescription>Supply {asset.symbol} to earn interest and use as collateral</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <div className="text-sm text-muted-foreground">
                Balance: {asset.balance} {asset.symbol}
              </div>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-20"
              />
              <Button variant="secondary" size="sm" className="absolute right-1 top-1" onClick={handleMaxClick}>
                Max
              </Button>
            </div>
            {Number.parseFloat(amount) > asset.balance && (
              <p className="text-sm text-destructive">Insufficient balance</p>
            )}
          </div>

          {/* Credit score feedback */}
          <div className="space-y-2 rounded-lg border border-accent p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">AI Credit Score Impact</h4>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">
                  {currentScore} → {newScore}
                </span>
                {scoreIncrease > 0 && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    +{scoreIncrease}
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${scorePercentage}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              Higher credit score reduces collateral requirements and increases borrowing limits
            </p>
          </div>

          {/* Collateral toggle */}
          <div className="flex items-center justify-between rounded-lg border border-accent p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Enable as Collateral</h4>
                <div className="group relative">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute left-0 top-6 z-50 hidden w-64 rounded-md bg-popover p-3 text-sm text-popover-foreground shadow-md group-hover:block">
                    Assets used as collateral can be borrowed against but may be liquidated if your health factor drops
                    too low
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isCollateralEnabled
                  ? "This asset will be used as collateral"
                  : "This asset will not be used as collateral"}
              </p>
            </div>
            <Switch checked={isCollateralEnabled} onCheckedChange={setIsCollateralEnabled} />
          </div>

          {/* Reward breakdown */}
          <Collapsible open={isRewardsOpen} onOpenChange={setIsRewardsOpen} className="rounded-lg border border-accent">
            <div className="flex items-center justify-between p-4">
              <h4 className="font-medium">Reward Breakdown</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isRewardsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle reward breakdown</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="border-t border-accent px-4 pb-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Base APY</span>
                  <span className="text-sm">{asset.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Restaking Bonus</span>
                  <span className="text-sm">{asset.restakingApy}%</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total APY</span>
                  <span className="text-primary">{asset.apy + asset.restakingApy}%</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Gas fee estimate */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Gas Fee</span>
            <span>~0.0012 ETH</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            className={cn("w-full sm:w-auto", isProcessing && "opacity-80")}
            disabled={
              !amount || Number.parseFloat(amount) <= 0 || Number.parseFloat(amount) > asset.balance || isProcessing
            }
          >
            {isProcessing ? "Processing..." : "Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
