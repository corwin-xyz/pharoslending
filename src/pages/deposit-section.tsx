import { useState } from "react"
import { Bitcoin, EclipseIcon as Ethereum, Info, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepositModal } from "@/components/deposit-modal"
import { useToast } from "@/hooks/use-toast"
import { ModeToggle } from "@/components/mode-toggle"
import { useWallet } from "@/hooks/useWallet"

// Mock data for assets
const assets = [
  {
    id: "wbtc",
    name: "Wrapped Bitcoin",
    symbol: "wBTC",
    icon: Bitcoin,
    balance: 0.05,
    value: 1500,
    apy: 4.5,
    restakingApy: 2.0,
  },
  {
    id: "weth",
    name: "Wrapped Ethereum",
    symbol: "wETH",
    icon: Ethereum,
    balance: 1.2,
    value: 1200,
    apy: 3.8,
    restakingApy: 1.5,
  },
]

export default function DepositSection() {
  const [selectedAsset, setSelectedAsset] = useState<(typeof assets)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()
  const {activityScore} = useWallet()

  const handleAssetSelect = (asset: (typeof assets)[0]) => {
    setSelectedAsset(asset)
    setIsModalOpen(true)
  }

  const handleDepositSuccess = (amount: number, symbol: string) => {
    toast({
      title: "Deposit Successful",
      description: `Deposited ${amount} ${symbol}, received ${(amount * 1000).toFixed(0)} $USDC`,
      className: "bg-accent text-foreground",
    })
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-4 bg-background px-4 py-4 shadow-sm lg:-mx-6 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Deposit Assets</h1>
          <div className="flex items-center gap-2">
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="Credit Score"
            value={activityScore.toFixed(0)}
            tooltip="Your AI-generated credit score based on on-chain activity"
          />
          <MetricCard title="Total Deposited" value="$3,700" tooltip="Total value of your deposited assets" />
          <MetricCard title="Average APY" value="6.3%" tooltip="Combined APY including base and restaking rewards" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 px-1">
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="w-full max-w-[400px] grid grid-cols-2 p-1">
            <TabsTrigger value="deposit" className="px-8 py-2">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="px-8 py-2">
              Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="mt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onSelect={() => handleAssetSelect(asset)} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="withdraw">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Your Deposited Assets</h3>
                <Button variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b border-accent p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                          <Bitcoin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">wBTC</p>
                          <p className="text-sm text-muted-foreground">Wrapped Bitcoin</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">0.025 wBTC</p>
                        <p className="text-sm text-muted-foreground">$1,500</p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Deposited</span>
                        <span className="font-medium">2 days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interest Earned</span>
                        <span className="font-medium text-primary">+0.0002 wBTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Health Factor</span>
                        <span className="font-medium text-green-500">1.8</span>
                      </div>
                      <Button className="mt-2 w-full">Withdraw</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b border-accent p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                          <Ethereum className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">wETH</p>
                          <p className="text-sm text-muted-foreground">Wrapped Ethereum</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">0.5 wETH</p>
                        <p className="text-sm text-muted-foreground">$1,200</p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Deposited</span>
                        <span className="font-medium">5 days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interest Earned</span>
                        <span className="font-medium text-primary">+0.005 wETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Health Factor</span>
                        <span className="font-medium text-green-500">2.1</span>
                      </div>
                      <Button className="mt-2 w-full">Withdraw</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Deposit Modal */}
      {selectedAsset && (
        <DepositModal
          asset={selectedAsset}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleDepositSuccess}
        />
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  tooltip?: string
}

function MetricCard({ title, value, tooltip }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-accent bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {tooltip && (
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground" />
            <div className="absolute right-0 top-6 z-50 hidden w-64 rounded-md bg-popover p-3 text-sm text-popover-foreground shadow-md group-hover:block">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

interface AssetCardProps {
  asset: (typeof assets)[0]
  onSelect: () => void
}

function AssetCard({ asset, onSelect }: AssetCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-accent p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <asset.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{asset.symbol}</p>
              <p className="text-sm text-muted-foreground">{asset.name}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-medium">
              {asset.balance} {asset.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="font-medium">${asset.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">APY</span>
            <span className="font-medium text-primary">
              {asset.apy}% + {asset.restakingApy}% restaking
            </span>
          </div>
          <Button className="mt-2 w-full" onClick={onSelect}>
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
