import { ComponentType, SVGProps } from "react"

type Props = {
    className?: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    count: number
    name: string
}

export default function CountCard({ className = "", Icon, count, name }: Props) {
    return (
        <div className={`shadow-lg w-full p-6 bg-white/50 rounded-xl ${className}`}>
            <div className="flex justify-between items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-cta rounded-md text-black p-1">
                    <Icon className="w-8 h-8" />
                </div>
                <div className="text-right">
                    <h1 className="font-heading font-bold text-4xl">{count}</h1>
                    <span className="block font-heading font-bold text-secondary text-sm">{name}</span>
                </div>
            </div>
        </div>
    )
}