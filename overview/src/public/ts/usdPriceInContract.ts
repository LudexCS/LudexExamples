export function usdPriceInContract (n: Number)
: bigint
{
    const str = n.toString();

    const parts = str.split('.');
        if(parts.length === 1)
        {
            return BigInt(str) * (10n ** 18n);
        }
        else if (parts.length === 2)
        {
            const intPart = BigInt(parts[0]) * (10n ** 18n);
            const decimalPartLength = parts[1].length;
            const decimalPart = 
                BigInt(parts[1]) * (10n ** (18n - BigInt(decimalPartLength)));
            return intPart + decimalPart;
        }
        else
        {
            throw new Error(`Invalid number format given: ${str}`);
        }
}