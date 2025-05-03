import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import React from 'react';

const Landing: React.FC = () => {
    const { connectWallet, disconnect, connected } = useWallet();
    return (
        <div className="container mt-8 md:pr-32 lg:pr-96">
            <h1 className="text-5xl/[1.1] font-bold text-slate-800">Decentralized Lending with AI Credit Scoring and Restaking</h1>
            <p className="text-xl font-[400] text-slate-700 mt-4">
                Revolutionizing DeFi lending with AI-powered credit scoring and <span className="lg:block">Pharos’ native restaking for secure and efficient borrowing.</span>
            </p>
            <div className="mt-8">
                <Button
                  variant="default"
                  size="sm"
                  onClick={connectWallet}>
                    Get Started
                </Button>
            </div>
        </div>
    );
};

export default Landing;