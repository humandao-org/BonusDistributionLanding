export const ClaimStatus = {
  Unknown: 0,
  Verifying: 1,
  CanClaim: 2,
  CannotClaim: 3,
  Processing: 4,
  ClaimDone: 5, // claim just done
  HasClaimed: 6, // previously claimed
  ClaimFailed: 7,
  UserRejected: 8,
  ClaimTimedOut: 9
}
