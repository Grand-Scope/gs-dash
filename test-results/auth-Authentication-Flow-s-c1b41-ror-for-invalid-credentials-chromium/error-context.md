# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "GrandScope Logo" [ref=e5]
      - generic [ref=e6]: GrandScope
    - heading "Welcome back" [level=1] [ref=e7]
    - paragraph [ref=e8]: Sign in to manage your projects and collaborate with your team
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Email or Username
        - textbox "Email or Username" [ref=e12]:
          - /placeholder: you@example.com or username
          - text: invalid@example.com
      - generic [ref=e13]:
        - generic [ref=e14]: Password
        - generic [ref=e15]:
          - textbox "Password" [ref=e16]:
            - /placeholder: ••••••••
            - text: WrongPassword
          - button "Show password" [ref=e17] [cursor=pointer]:
            - img [ref=e18]
      - button "Sign In" [active] [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - text: Don't have an account?
      - link "Sign up" [ref=e23] [cursor=pointer]:
        - /url: /register
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - generic [ref=e32]:
      - text: Compiling
      - generic [ref=e33]:
        - generic [ref=e34]: .
        - generic [ref=e35]: .
        - generic [ref=e36]: .
  - alert [ref=e37]
```