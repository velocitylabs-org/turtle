import Identicon from '@polkadot/react-identicon'
import { cn } from '@velocitylabs-org/turtle-ui'
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime'
import useLookupName from '@/hooks/useLookupName'
import { truncateAddress } from '@/utils/address'
import CopyAddress from './ClipboardCopy'
export default function Account(_a) {
  var network = _a.network,
    addressType = _a.addressType,
    address = _a.address,
    className = _a.className,
    _b = _a.allowCopy,
    allowCopy = _b === void 0 ? true : _b,
    _c = _a.size,
    size = _c === void 0 ? 14 : _c
  var accountName = useLookupName(network, address)
  var accountDisplay = accountName ? accountName : truncateAddress(address, 4, 4)
  return _jsxs('div', {
    className: 'flex items-center gap-x-1',
    children: [
      addressType === 'ss58' &&
        _jsx(Identicon, {
          value: address,
          size: size,
          theme: 'polkadot',
          className: cn('mr-1 rounded-full border border-turtle-secondary-dark hover:cursor-default', className),
        }),
      addressType === 'evm' &&
        _jsx('div', {
          className: cn(
            'mr-1 flex items-start overflow-hidden rounded-full border border-turtle-secondary-dark hover:cursor-default',
            className,
          ),
          style: { width: size, height: size },
          children: _jsx(Identicon, {
            value: address,
            size: size,
            theme: 'ethereum',
            className: 'hover:cursor-default',
          }),
        }),
      !addressType &&
        _jsx('div', {
          className: cn(
            'mr-1 flex items-start overflow-hidden rounded-full border border-turtle-secondary-dark hover:cursor-default',
            className,
            network === 'Ethereum'
              ? 'bg-gradient-to-tr from-green-400 to-blue-500'
              : 'bg-gradient-to-tr from-indigo-500 to-pink-500',
          ),
          style: { width: size, height: size },
        }),
      allowCopy
        ? _jsx(CopyAddress, { content: accountDisplay, address: address })
        : _jsx('p', { className: 'text-sm', children: accountDisplay }),
    ],
  })
}
//# sourceMappingURL=Account.js.map
