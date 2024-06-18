'use client'
import { FC } from 'react'

const OngoingTransferModal: FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="rounded-t-xl bg-purple-100 p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-700">
            <i className="fab fa-ethereum"></i>
            <i className="fas fa-arrow-right"></i>
            <i className="fas fa-rocket"></i>
          </div>
          <div className="mt-2 text-4xl font-bold text-purple-700">542.312 DAI</div>
          <div className="text-sm text-gray-500">Sunday May 19, 2024 8:32 am</div>
        </div>
        <div className="mt-4 border-t border-purple-200 pt-4">
          <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
            <div className="font-medium text-purple-700">Step 2 of 3 Arrived at AssetHub</div>
            <div className="text-sm text-gray-500">Today 1:38 pm</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-purple-200">
            <div className="h-2 w-2/3 rounded-full bg-purple-700"></div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <img src="https://placehold.co/32x32" alt="Sender's avatar" className="rounded-full" />
            <div className="text-gray-700">brandonhaslegs.eth</div>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <img
              src="https://placehold.co/32x32"
              alt="Receiver's avatar"
              className="rounded-full"
            />
            <div className="text-gray-700">0f17-2h97</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-gray-700">
            <div>Transfer amount</div>
            <div>
              3124.1974 OP <span className="text-gray-500">$25,597.19</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Fees</div>
            <div>
              27.1974 OP <span className="text-gray-500">$297.19</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-medium text-gray-700">Summary</div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Convert from</div>
            <div>
              12 ETH <span className="text-gray-500">$44,390.88</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Min receive</div>
            <div>
              11.8056 ETH <span className="text-gray-500">$43,671.84</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Exchange rate</div>
            <div>1 ETH = 0.9987 ETH</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-medium text-gray-700">Fee breakdown</div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Cross-chain gas fees</div>
            <div>
              0.01034 ETH <span className="text-gray-500">$38.29</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Gas refund</div>
            <div>
              - 0.002585 ETH <span className="text-gray-500">$9.56</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-gray-700">
            <div>Total</div>
            <div>
              0.007756 ETH <span className="text-gray-500">$28.72</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 py-2 text-gray-700">
            <span>View on Block Explorer</span>
            <i className="fas fa-external-link-alt"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OngoingTransferModal
