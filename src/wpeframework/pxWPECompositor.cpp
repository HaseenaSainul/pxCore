#include "../pxCore.h"
#include "../pxWindow.h"
#include "../pxWindowUtil.h"
#include "../pxKeycodes.h"
#include "pxWPECompositor.h"
#include "pxWindowNative.h"

using namespace WPEFramework;
#define MOD_SHIFT       0x01
#define MOD_ALT         0x08
#define MOD_CTRL        0x04

static const char* ltxt = "\t\t1234567890-=\t\tqwertyuiop[]\t\tasdfghjkl;'`\t\\zxcvbnm,./\t\t\t ";
static const char* utxt = "\t\t!@#$%^&*()_+\t\tQWERTYUIOP{}\t\tASDFGHJKL:\"~\t|ZXCVBNM<>?\t\t\t ";
#if 0
static inline std::string keyCodeToString(uint16_t code, bool shift)
{
    assert(LINUX_KEY_1 == 2 && LINUX_KEY_SPACE == 57);
    if (code >= LINUX_KEY_1 && code <= LINUX_KEY_SPACE && *(utxt + code) != '\t')
        return std::string(shift ? (utxt + code) : (ltxt + code), 1);
    return std::string();
}
#endif
void Keyboard::Direct(const uint32_t key, const state action)
{
    std::vector<pxWindowNative*> windowVector = pxWindow::getNativeWindows();
    std::vector<pxWindowNative*>::iterator i;
    unsigned long flags = 0;
    flags |= mShiftPressed ? PX_MOD_SHIFT:0;
    flags |= mCtrlPressed ? PX_MOD_CONTROL:0;
    flags |= mAltPressed ? PX_MOD_ALT:0;
    for (i = windowVector.begin(); i < windowVector.end(); i++)
    {
        pxWindowNative* w = (*i);
        if (action == pressed)
        {
            w->onKeyDown(keycodeFromNative(key),flags);
            w->onChar(keycodeToAscii(keycodeFromNative(key), flags));
        }
        else
        {
            w->onKeyUp(keycodeFromNative(key), flags);
        }
    }
}

void Keyboard::Modifiers(uint32_t depressedMods, uint32_t latchedMods, uint32_t lockedMods, uint32_t group)
{
    if (depressedMods & MOD_SHIFT)
    {
        mShiftPressed = true;
    }
    else
    {
        mShiftPressed = false;
    }

    if (depressedMods & MOD_ALT)
    {
        mAltPressed = true;
    }
    else
    {
        mAltPressed = false;
    }

    if (depressedMods & MOD_CTRL)
    {
        mCtrlPressed = true;
    }
    else
    {
        mCtrlPressed = false;
    }
}
