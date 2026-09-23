# Mini-home guide

[한국어](minihome.md) · [Get started](../README.md)

Choose **미니룸 꾸미기** (Edit room) to add up to 40 furniture objects and drag them into place. Selection, movement and rotation buttons are also available. **꾸미기 완료** (Finish editing) lets you click the floor to move your avatar. Right-drag to orbit.

**프로필 수정** edits your name, title, bio and mood. Diary and guestbook entries are browser-local notes, not remote visitor messages.

## Save and recover

Edits autosave after 1.2 seconds. **미니홈피 저장** saves immediately. Storage failures or changes saved by another tab stop autosave. Export your work before reloading a conflicting tab.

The previous valid save is retained separately. If the current save is corrupt, the backup is presented for review and manual saving. The original is not automatically replaced. Clearing browser data or ending a private session can remove saves; keep file backups.

## Undo and files

**실행 취소 / 다시 실행** (Undo / Redo) retains up to 50 changes across room, profile, theme and notes. Reloading clears history but keeps saved data. A new edit clears the redo branch.

**파일 백업** downloads the whole home as JSON. **백업 가져오기** validates supported files up to 512 KB before applying them. Invalid files leave the home unchanged. Valid imports can be undone.

## Sharing and Unity

**방 공유** creates a link containing only your profile and room, excluding diary and guestbook entries. It is a snapshot, not synchronization. Opening it preserves the recipient's local save. **내 방으로 가져오기** adopts the profile, theme and room while retaining the recipient's diary and guestbook; saving remains explicit. Undo restores the recipient's previous home. You can write notes after adoption. Use JSON backups when a service cannot handle long links.

**3D 방 내보내기 (.glb)** exports visible geometry and materials, excluding profile text, notes and gameplay. See the [Unity guide](unity.en.md).
